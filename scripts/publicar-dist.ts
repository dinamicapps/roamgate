#!/usr/bin/env bun
/**
 * publicar-dist - construye roamgate.exe para Windows y lo deja publicado en el espejo dist.
 *
 *   bun scripts/publicar-dist.ts [--espejo <ruta>] [--push] [--permitir-sucio]
 *
 * El espejo (default `E:\DinamicAPPS\roamgate-dist`, o la variable ROAMGATE_DIST_ESPEJO) es el clon
 * de `dinamicapps/roamgate-dist`: el canal de distribucion para los devs. No contiene fuentes, solo
 * el binario publicado, su VERSION y el instalador. Este script construye, VERIFICA QUE EL BINARIO
 * DIGA LA VERSION QUE SE PUBLICA, empaqueta, copia, commitea y etiqueta. El push solo con `--push`.
 *
 * El binario viaja como zip (`bin/roamgate-windows-x64.zip`) y NO como .exe: el .exe pesa ~109 MB y
 * GitHub rechaza archivos de mas de 100 MB. El zip ronda los 46 MB; el script aborta si pasa de
 * 95 MB, antes de tocar el espejo. El instalador extrae `roamgate.exe` junto a `roamgate.cmd`.
 *
 * Lo que este script NO hace, a proposito:
 *   - No edita el fuente para versionar: la version es la de `server/package.json`, que es la que
 *     el binario embebe y la que reporta `roamgate --version`.
 *   - No verifica integridad (checksum) de lo que copia, y por eso no lo promete.
 *   - No publica por CI ni por GitHub Releases. El canal es el espejo.
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

// --- Contrato del artefacto -------------------------------------------------------------------

export const ARTEFACTO = "roamgate";
export const ARCHIVO_VERSION = "VERSION-roamgate";
/** Ruta del zip DENTRO del espejo. El instalador la lee de VERSION-roamgate (`bundle=`). */
export const BUNDLE = "bin/roamgate-windows-x64.zip";
/** Lo que `bun run build:windows-x64` deja en el fuente, relativo a la raiz del repo. */
export const BINARIO_CONSTRUIDO = "server/roamgate-windows-x64.exe";
/** Nombre del .exe dentro del zip: es el que `roamgate.cmd` lanza. */
export const BINARIO_PUBLICADO = "roamgate.exe";
/** Margen bajo los 100 MB por archivo de GitHub: un zip que se acerque no debe llegar al push. */
export const LIMITE_ZIP_BYTES = 95 * 1024 * 1024;
export const ESPEJO_DEFECTO = "E:\\DinamicAPPS\\roamgate-dist";
export const VARIABLE_ESPEJO = "ROAMGATE_DIST_ESPEJO";
export const RAMA_DIST = "main";

/**
 * Rutas cuyo contenido entra en lo que esta publicacion PUBLICA. El gate de arbol limpio se limita
 * a estas: el sha que se publica afirma "esto salio de estas fuentes". `agent-os/` y demas archivos
 * de trabajo no se publican, asi que abortar por ellos volveria el gate un estorbo.
 *
 * `scripts` entra entero: contiene esta receta y `scripts/instalador/`, que se copia al espejo en el
 * mismo commit y bajo el mismo tag que el zip. Un instalador publicado desde un arbol sucio haria
 * que el rollback por tag restituyera algo que no existe en ningun commit del fuente.
 */
export const RUTAS_FUENTE = [
  "server",
  "web",
  "shared",
  "package.json",
  "bun.lock",
  "tsconfig.json",
  "scripts",
];

/**
 * Lo que se publica junto al zip. Vive versionado en `scripts/instalador/` y se copia en cada
 * publicacion: en el espejo son artefactos publicados, no archivos editables.
 *
 * El fin de linea se fija al copiar y no se deja a `core.autocrlf` de quien publica: un `.cmd` con
 * LF rompe etiquetas y `goto` en cmd.exe, y un `.sh` con CRLF rompe bash. Los `gitignore-dist` /
 * `gitattributes-dist` se renombran al copiarlos: con su nombre real en `scripts/instalador/`
 * aplicarian al repo fuente.
 */
export const PUBLICADOS: ReadonlyArray<{
  fuente: string;
  destino: string;
  finDeLinea: "lf" | "crlf";
}> = [
  { fuente: "install.ps1", destino: "install.ps1", finDeLinea: "crlf" },
  { fuente: "install.sh", destino: "install.sh", finDeLinea: "lf" },
  { fuente: "roamgate.cmd", destino: "roamgate.cmd", finDeLinea: "crlf" },
  { fuente: "README.md", destino: "README.md", finDeLinea: "lf" },
  { fuente: "gitignore-dist", destino: ".gitignore", finDeLinea: "lf" },
  {
    fuente: "gitattributes-dist",
    destino: ".gitattributes",
    finDeLinea: "lf",
  },
];

// --- Logica pura ------------------------------------------------------------------------------

export class ErrorDePublicacion extends Error {
  constructor(
    mensaje: string,
    readonly detalle?: string,
  ) {
    super(mensaje);
  }
}

export type Opciones = {
  espejo: string;
  push: boolean;
  permitirSucio: boolean;
};

export function interpretarArgumentos(
  argv: readonly string[],
  env: Readonly<Record<string, string | undefined>>,
): Opciones {
  let espejo: string | undefined;
  let push = false;
  let permitirSucio = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--push") push = true;
    else if (a === "--permitir-sucio") permitirSucio = true;
    else if (a.startsWith("--espejo=")) espejo = a.slice("--espejo=".length);
    else if (a === "--espejo") {
      const valor = argv[++i];
      if (!valor || valor.startsWith("--")) {
        throw new ErrorDePublicacion("--espejo necesita una ruta");
      }
      espejo = valor;
    } else {
      throw new ErrorDePublicacion(
        `argumento desconocido: ${a}`,
        "uso: bun scripts/publicar-dist.ts [--espejo <ruta>] [--push] [--permitir-sucio]",
      );
    }
  }
  if (espejo !== undefined && espejo.trim() === "") {
    throw new ErrorDePublicacion("--espejo necesita una ruta");
  }
  const desdeEnv = env[VARIABLE_ESPEJO]?.trim();
  return {
    espejo: espejo ?? (desdeEnv ? desdeEnv : ESPEJO_DEFECTO),
    push,
    permitirSucio,
  };
}

const SEMVER_RE = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

export function validarVersion(version: string): string {
  if (!SEMVER_RE.test(version)) {
    throw new ErrorDePublicacion(
      `version invalida: "${version}" (se espera semver, ej. 0.7.15-dinamicapps.1)`,
    );
  }
  return version;
}

export function leerVersionPaquete(textoPackageJson: string): string {
  const version = (JSON.parse(textoPackageJson) as { version?: unknown })
    .version;
  if (typeof version !== "string") {
    throw new ErrorDePublicacion("server/package.json no declara version");
  }
  return validarVersion(version);
}

export function nombreTag(version: string): string {
  return `${ARTEFACTO}-v${version}`;
}

export function mensajeCommit(version: string, sha: string): string {
  return `${ARTEFACTO} v${version} (${sha})`;
}

export function contenidoArchivoVersion(datos: {
  version: string;
  sha: string;
  publicado: Date;
}): string {
  return [
    `artefacto=${ARTEFACTO}`,
    `version=${datos.version}`,
    `sha=${datos.sha}`,
    `bundle=${BUNDLE}`,
    `publicado=${datos.publicado.toISOString()}`,
    "",
  ].join("\n");
}

/** `roamgate --version` imprime `roamgate <version>`; devuelve la version o null. */
export function versionReportada(salida: string): string | null {
  const m = /^roamgate (\S+)\s*$/m.exec(salida.trim());
  return m ? m[1] : null;
}

export function validarTamanoZip(bytes: number): void {
  if (bytes > LIMITE_ZIP_BYTES) {
    throw new ErrorDePublicacion(
      `el zip pesa ${mb(bytes)}: supera el limite de ${mb(LIMITE_ZIP_BYTES)}`,
      "GitHub rechaza archivos de mas de 100 MB. No se copio nada al espejo.",
    );
  }
}

export function normalizarFinDeLinea(
  texto: string,
  fin: "lf" | "crlf",
): string {
  const lf = texto.replace(/\r\n/g, "\n");
  return fin === "crlf" ? lf.replace(/\n/g, "\r\n") : lf;
}

/** Comillas simples de PowerShell: la unica secuencia especial es la propia comilla, duplicada. */
export function comillasPowerShell(texto: string): string {
  return `'${texto.replace(/'/g, "''")}'`;
}

export function mismaRuta(a: string, b: string): boolean {
  const normal = (r: string) =>
    resolve(r).replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
  return normal(a) === normal(b);
}

export function mb(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// --- Efectos ----------------------------------------------------------------------------------

function git(args: string[], cwd: string): { ok: boolean; salida: string } {
  const r = Bun.spawnSync(["git", ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
  return {
    ok: r.exitCode === 0,
    salida: (r.exitCode === 0
      ? r.stdout.toString()
      : r.stderr.toString() || r.stdout.toString()
    ).trim(),
  };
}

export type Dependencias = {
  /** Construye y devuelve la ruta del .exe. Inyectable para probar sin el build de ~1 min. */
  construir: (repo: string) => string;
  /** Salida de `<exe> --version`. */
  versionDelBinario: (rutaExe: string) => string;
  ahora: () => Date;
  log: (linea: string) => void;
};

export const dependenciasReales: Dependencias = {
  construir(repo) {
    const exe = join(repo, BINARIO_CONSTRUIDO);
    const inicio = Date.now();
    const r = Bun.spawnSync(["bun", "run", "build:windows-x64"], {
      cwd: repo,
      stdout: "inherit",
      stderr: "inherit",
    });
    if (r.exitCode !== 0) {
      throw new ErrorDePublicacion(
        `fallo bun run build:windows-x64 (salida ${r.exitCode})`,
      );
    }
    // Un .exe viejo que sobrevive a un build fallido a medias se publicaria con la version nueva
    // en VERSION-roamgate. Solo vale el que este build acaba de escribir.
    if (!existsSync(exe) || statSync(exe).mtimeMs < inicio - 2000) {
      throw new ErrorDePublicacion(
        `el build no dejo un binario nuevo en ${exe}`,
      );
    }
    return exe;
  },
  versionDelBinario(rutaExe) {
    const r = Bun.spawnSync([rutaExe, "--version"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    return `${r.stdout.toString()}${r.stderr.toString()}`;
  },
  ahora: () => new Date(),
  log: (linea) => console.log(linea),
};

function comprimir(origen: string, zip: string): void {
  const comando = [
    "$ProgressPreference = 'SilentlyContinue'",
    `Compress-Archive -LiteralPath ${comillasPowerShell(origen)} -DestinationPath ${comillasPowerShell(zip)} -CompressionLevel Optimal -Force`,
  ].join("; ");
  const r = Bun.spawnSync(
    ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", comando],
    { stdout: "pipe", stderr: "pipe" },
  );
  if (r.exitCode !== 0 || !existsSync(zip)) {
    throw new ErrorDePublicacion(
      "no se pudo crear el zip con Compress-Archive",
      r.stderr.toString().trim(),
    );
  }
}

export type Resultado = {
  version: string;
  sha: string;
  tag: string;
  bytesZip: number;
  empujado: boolean;
};

export function publicar(
  opciones: Opciones,
  repo: string,
  deps: Dependencias = dependenciasReales,
): Resultado {
  const ok = (etiqueta: string, nota = "") =>
    deps.log(`  [ok]    ${etiqueta.padEnd(22)} ${nota}`.trimEnd());

  if (process.platform !== "win32") {
    throw new ErrorDePublicacion(
      "publicar-dist es Windows-only: empaqueta con Compress-Archive y verifica el .exe ejecutandolo",
    );
  }

  // --- 1. GATE: el arbol de fuentes debe estar limpio ----------------------------------------
  // Lo PRIMERO: con cambios sin commitear, el sha publicado describiria un codigo que no es el que
  // se construyo. Con --permitir-sucio se publica igual, pero el sha lo dice.

  const sucio = git(["status", "--porcelain", "--", ...RUTAS_FUENTE], repo);
  if (!sucio.ok) {
    throw new ErrorDePublicacion(
      "no se pudo consultar el estado de git del fuente",
      sucio.salida,
    );
  }
  const haySucio = sucio.salida !== "";
  if (haySucio && !opciones.permitirSucio) {
    throw new ErrorDePublicacion(
      "el arbol de fuentes tiene cambios sin commitear",
      `${sucio.salida}\n\ncommitea o descarta antes de publicar (o pasa --permitir-sucio, y el sha lo dira). No se construyo nada.`,
    );
  }

  const head = git(["rev-parse", "--short", "HEAD"], repo);
  if (!head.ok) {
    throw new ErrorDePublicacion("no se pudo leer el sha de HEAD", head.salida);
  }
  const sha = haySucio ? `${head.salida}-sucio` : head.salida;
  ok(haySucio ? "arbol SUCIO" : "arbol limpio", `sha ${sha}`);

  const version = leerVersionPaquete(
    readFileSync(join(repo, "server", "package.json"), "utf8"),
  );
  ok(`version ${version}`, "(server/package.json)");

  // --- 2. Estado del espejo -----------------------------------------------------------------
  // Se valida antes de construir: si el espejo no sirve, no tiene sentido gastar el build.

  const espejo = resolve(opciones.espejo);
  if (!existsSync(espejo) || !statSync(espejo).isDirectory()) {
    throw new ErrorDePublicacion(
      `el espejo no existe: ${espejo}`,
      `clona dinamicapps/roamgate-dist ahi, o pasa --espejo <ruta> / ${VARIABLE_ESPEJO}`,
    );
  }
  // `rev-parse --git-dir` tambien acierta en una subcarpeta de OTRO repo: se exige que el espejo
  // sea la raiz de su propio repo, o se commitearia el zip en el repo equivocado.
  const raiz = git(["rev-parse", "--show-toplevel"], espejo);
  if (
    !raiz.ok ||
    !mismaRuta(realpathSync.native(raiz.salida), realpathSync.native(espejo))
  ) {
    throw new ErrorDePublicacion(
      `el espejo no es un repo git: ${espejo}`,
      raiz.ok
        ? `es una carpeta dentro del repo ${raiz.salida}`
        : "clona dinamicapps/roamgate-dist ahi",
    );
  }
  const espejoSucio = git(["status", "--porcelain"], espejo);
  if (espejoSucio.salida !== "") {
    throw new ErrorDePublicacion(
      `el espejo tiene cambios sin commitear: ${espejo}`,
      `${espejoSucio.salida}\n\nresuelvelos antes: la publicacion commitea todo lo que haya ahi.`,
    );
  }
  const tag = nombreTag(version);
  if (git(["rev-parse", "-q", "--verify", `refs/tags/${tag}`], espejo).ok) {
    throw new ErrorDePublicacion(
      `el tag ${tag} ya existe en el espejo`,
      "sube la version en los package.json: una publicacion no se pisa.",
    );
  }
  if (opciones.push) {
    const rama = git(["symbolic-ref", "--short", "HEAD"], espejo);
    if (!rama.ok || rama.salida !== RAMA_DIST) {
      throw new ErrorDePublicacion(
        `--push exige que el espejo este en ${RAMA_DIST} (esta en ${rama.ok ? rama.salida : "?"})`,
      );
    }
    if (!git(["remote", "get-url", "origin"], espejo).ok) {
      throw new ErrorDePublicacion(
        "--push exige un remoto origin en el espejo",
      );
    }
  }
  ok("espejo listo", tag);

  // --- 3. Construir y comprobar que el binario dice la version que se publica ------------------
  // Se empaqueta en un TEMPORAL: nada toca el espejo hasta pasar la version y el tamano.

  const exe = deps.construir(repo);
  const reportada = versionReportada(deps.versionDelBinario(exe));
  if (reportada !== version) {
    throw new ErrorDePublicacion(
      "el binario construido no reporta la version que se publica",
      `roamgate --version: ${reportada ?? "(sin version)"}\nesperado:           ${version}\n\nNo se copio nada al espejo.`,
    );
  }
  ok("binario", `${mb(statSync(exe).size)}  roamgate ${reportada}`);

  const temporal = mkdtempSync(join(tmpdir(), "roamgate-publicar-"));
  let bytesZip: number;
  try {
    const exeRenombrado = join(temporal, BINARIO_PUBLICADO);
    copyFileSync(exe, exeRenombrado);
    const zipTemporal = join(temporal, "roamgate-windows-x64.zip");
    comprimir(exeRenombrado, zipTemporal);
    bytesZip = statSync(zipTemporal).size;
    validarTamanoZip(bytesZip);
    ok("zip", `${mb(bytesZip)} (limite ${mb(LIMITE_ZIP_BYTES)})`);

    const destinoZip = join(espejo, BUNDLE);
    mkdirSync(join(espejo, "bin"), { recursive: true });
    copyFileSync(zipTemporal, destinoZip);
    deps.log(`  [copy]  -> ${destinoZip}`);
  } finally {
    rmSync(temporal, { recursive: true, force: true });
  }

  // --- 4. VERSION + instalador: viajan en el mismo commit y bajo el mismo tag ----------------

  writeFileSync(
    join(espejo, ARCHIVO_VERSION),
    contenidoArchivoVersion({ version, sha, publicado: deps.ahora() }),
    "utf8",
  );
  deps.log(`  [ver]   ${ARCHIVO_VERSION.padEnd(18)} v${version} sha=${sha}`);

  for (const { fuente, destino, finDeLinea } of PUBLICADOS) {
    const ruta = join(repo, "scripts", "instalador", fuente);
    if (!existsSync(ruta)) {
      throw new ErrorDePublicacion(
        `falta un archivo publicable en el fuente: ${ruta}`,
      );
    }
    writeFileSync(
      join(espejo, destino),
      normalizarFinDeLinea(readFileSync(ruta, "utf8"), finDeLinea),
      "utf8",
    );
  }
  deps.log(
    `  [pub]   ${PUBLICADOS.map((p) => p.destino).join(" + ")} -> ${espejo}`,
  );

  // --- 5. Commit + tag (y push solo si se pidio) -----------------------------------------------
  // Sin tag el rollback del README (`git checkout roamgate-v...`) no tiene a que apuntar.

  const pasos: Array<[string[], string]> = [
    [["add", "-A"], "no se pudo preparar el commit en el espejo"],
    [
      ["commit", "-m", mensajeCommit(version, sha)],
      "no se pudo commitear en el espejo",
    ],
    [["tag", tag], "no se pudo etiquetar la publicacion"],
  ];
  if (opciones.push) {
    pasos.push(
      [["push", "-u", "origin", RAMA_DIST], `no se pudo subir ${RAMA_DIST}`],
      [["push", "origin", tag], `no se pudo subir el tag ${tag}`],
    );
  }
  for (const [args, falla] of pasos) {
    const r = git(args, espejo);
    if (!r.ok) {
      throw new ErrorDePublicacion(
        falla,
        `${r.salida}\n\nel espejo puede haber quedado a medias: revisa ${espejo} con git status.`,
      );
    }
  }
  ok("commit + tag", `${tag}${opciones.push ? " (subido)" : " (sin push)"}`);

  return { version, sha, tag, bytesZip, empujado: opciones.push };
}

// --- Main ------------------------------------------------------------------------------------

if (import.meta.main) {
  console.log("  roamgate - publicar dist Windows");
  console.log("  --------------------------------");
  try {
    const opciones = interpretarArgumentos(process.argv.slice(2), process.env);
    const repo = resolve(import.meta.dir, "..");
    const r = publicar(opciones, repo);
    const espejo = resolve(opciones.espejo);
    console.log("");
    if (r.empujado) {
      console.log(`  Publicado: ${r.tag} en origin.`);
    } else {
      console.log("  Listo para publicar. Revisa y sube:");
      console.log("");
      console.log(`    cd ${espejo}`);
      console.log("    git show --stat");
      console.log(
        `    git push -u origin ${RAMA_DIST} && git push origin ${r.tag}`,
      );
      console.log("");
      console.log(
        "  (sin --push no se sube nada: el canal se revisa antes de soltarlo)",
      );
    }
  } catch (e) {
    if (e instanceof ErrorDePublicacion) {
      console.error(`  [ABORT] ${e.message}`);
      if (e.detalle) {
        console.error(
          e.detalle
            .split("\n")
            .map((l) => `          ${l}`)
            .join("\n"),
        );
      }
      process.exit(1);
    }
    throw e;
  }
}
