import { afterAll, describe, expect, test } from "bun:test";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  BUNDLE,
  contenidoArchivoVersion,
  type Dependencias,
  ESPEJO_DEFECTO,
  ErrorDePublicacion,
  interpretarArgumentos,
  LIMITE_ZIP_BYTES,
  leerVersionPaquete,
  mensajeCommit,
  mismaRuta,
  nombreTag,
  normalizarFinDeLinea,
  PUBLICADOS,
  publicar,
  VARIABLE_ESPEJO,
  validarTamanoZip,
  validarVersion,
  versionReportada,
} from "./publicar-dist";

describe("interpretarArgumentos", () => {
  test("sin argumentos usa el espejo por defecto, sin push", () => {
    expect(interpretarArgumentos([], {})).toEqual({
      espejo: ESPEJO_DEFECTO,
      push: false,
      permitirSucio: false,
    });
  });

  test("la variable de entorno reemplaza al defecto y --espejo a ambos", () => {
    const env = { [VARIABLE_ESPEJO]: "D:\\otro" };
    expect(interpretarArgumentos([], env).espejo).toBe("D:\\otro");
    expect(interpretarArgumentos(["--espejo", "C:\\x"], env).espejo).toBe(
      "C:\\x",
    );
    expect(interpretarArgumentos(["--espejo=C:\\y"], env).espejo).toBe("C:\\y");
  });

  test("lee --push y --permitir-sucio", () => {
    const o = interpretarArgumentos(["--push", "--permitir-sucio"], {});
    expect(o.push).toBe(true);
    expect(o.permitirSucio).toBe(true);
  });

  test("rechaza --espejo sin ruta y argumentos desconocidos", () => {
    expect(() => interpretarArgumentos(["--espejo"], {})).toThrow(
      ErrorDePublicacion,
    );
    expect(() => interpretarArgumentos(["--espejo", "--push"], {})).toThrow(
      "--espejo necesita una ruta",
    );
    expect(() => interpretarArgumentos(["--espejo="], {})).toThrow(
      "--espejo necesita una ruta",
    );
    expect(() => interpretarArgumentos(["--forzar"], {})).toThrow(
      "argumento desconocido",
    );
  });
});

describe("version", () => {
  test("acepta semver con sufijo de prerelease", () => {
    expect(validarVersion("0.7.15-dinamicapps.1")).toBe("0.7.15-dinamicapps.1");
    expect(validarVersion("1.2.3")).toBe("1.2.3");
  });

  test("rechaza lo que no es semver", () => {
    expect(() => validarVersion("v0.7.15")).toThrow("version invalida");
    expect(() => validarVersion("0.7")).toThrow("version invalida");
  });

  test("lee la version de un package.json", () => {
    expect(
      leerVersionPaquete('{ "name": "x", "version": "0.7.15-dinamicapps.1" }'),
    ).toBe("0.7.15-dinamicapps.1");
    expect(() => leerVersionPaquete('{ "name": "x" }')).toThrow("version");
  });

  test("extrae la version de la salida de roamgate --version", () => {
    expect(versionReportada("roamgate 0.7.15-dinamicapps.1\r\n")).toBe(
      "0.7.15-dinamicapps.1",
    );
    expect(versionReportada("error: algo")).toBeNull();
    expect(versionReportada("")).toBeNull();
  });
});

describe("nombres de publicacion", () => {
  test("tag y mensaje de commit siguen el patron de los dist", () => {
    expect(nombreTag("0.7.15-dinamicapps.1")).toBe(
      "roamgate-v0.7.15-dinamicapps.1",
    );
    expect(mensajeCommit("0.7.15-dinamicapps.1", "cebc512")).toBe(
      "roamgate v0.7.15-dinamicapps.1 (cebc512)",
    );
  });

  test("VERSION-roamgate declara artefacto, version, sha, bundle y fecha", () => {
    const texto = contenidoArchivoVersion({
      version: "0.7.15-dinamicapps.1",
      sha: "cebc512",
      publicado: new Date("2026-10-12T20:00:00.000Z"),
    });
    expect(texto).toBe(
      [
        "artefacto=roamgate",
        "version=0.7.15-dinamicapps.1",
        "sha=cebc512",
        "bundle=bin/roamgate-windows-x64.zip",
        "publicado=2026-10-12T20:00:00.000Z",
        "",
      ].join("\n"),
    );
  });
});

describe("validaciones", () => {
  test("el zip no puede pasar de 95 MB", () => {
    expect(LIMITE_ZIP_BYTES).toBe(95 * 1024 * 1024);
    expect(() => validarTamanoZip(46 * 1024 * 1024)).not.toThrow();
    expect(() => validarTamanoZip(LIMITE_ZIP_BYTES)).not.toThrow();
    expect(() => validarTamanoZip(LIMITE_ZIP_BYTES + 1)).toThrow(
      "supera el limite",
    );
  });

  test("normaliza el fin de linea en ambos sentidos", () => {
    expect(normalizarFinDeLinea("a\nb\r\nc", "crlf")).toBe("a\r\nb\r\nc");
    expect(normalizarFinDeLinea("a\r\nb\nc", "lf")).toBe("a\nb\nc");
  });

  test("compara rutas sin importar separador, mayusculas ni barra final", () => {
    expect(mismaRuta("C:\\Temp\\Espejo\\", "c:/temp/espejo")).toBe(true);
    expect(mismaRuta("C:\\Temp\\Espejo", "C:\\Temp\\Otro")).toBe(false);
  });

  test("todo lo publicable existe en scripts/instalador", () => {
    const dir = resolve(import.meta.dir, "instalador");
    for (const { fuente } of PUBLICADOS) {
      expect(existsSync(join(dir, fuente))).toBe(true);
    }
  });
});

// --- Publicacion contra un espejo temporal (sin build real, sin push) ----------------------------

const enWindows = process.platform === "win32";
const repo = resolve(import.meta.dir, "..");
const base = mkdtempSync(join(tmpdir(), "roamgate-publicar-dist-test-"));
afterAll(() => rmSync(base, { recursive: true, force: true }));

function git(args: string[], cwd: string): string {
  const r = Bun.spawnSync(["git", ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "prueba",
      GIT_AUTHOR_EMAIL: "prueba@example.com",
      GIT_COMMITTER_NAME: "prueba",
      GIT_COMMITTER_EMAIL: "prueba@example.com",
    },
  });
  if (r.exitCode !== 0) throw new Error(r.stderr.toString());
  return r.stdout.toString().trim();
}

function espejoNuevo(nombre: string): string {
  const dir = join(base, nombre);
  mkdirSync(dir, { recursive: true });
  git(["init", "-q", "-b", "main"], dir);
  git(["config", "commit.gpgsign", "false"], dir);
  git(["config", "tag.gpgsign", "false"], dir);
  git(["config", "user.name", "prueba"], dir);
  git(["config", "user.email", "prueba@example.com"], dir);
  return dir;
}

function dependenciasFalsas(version: string): Dependencias {
  const exe = join(base, "falso-roamgate.exe");
  writeFileSync(exe, "no es un exe: el build se inyecta en la prueba");
  return {
    construir: () => exe,
    versionDelBinario: () => `roamgate ${version}\n`,
    ahora: () => new Date("2026-10-12T20:00:00.000Z"),
    log: () => {},
  };
}

const versionFuente = leerVersionPaquete(
  readFileSync(join(repo, "server", "package.json"), "utf8"),
);

describe.skipIf(!enWindows)("publicar contra un espejo temporal", () => {
  test("deja zip, VERSION, instalador, commit y tag", () => {
    const espejo = espejoNuevo("ok");
    const r = publicar(
      { espejo, push: false, permitirSucio: true },
      repo,
      dependenciasFalsas(versionFuente),
    );
    expect(r.tag).toBe(nombreTag(versionFuente));
    expect(existsSync(join(espejo, BUNDLE))).toBe(true);
    for (const { destino } of PUBLICADOS) {
      expect(existsSync(join(espejo, destino))).toBe(true);
    }
    expect(readFileSync(join(espejo, "roamgate.cmd"), "utf8")).toContain(
      "\r\n",
    );
    expect(readFileSync(join(espejo, "install.sh"), "utf8")).not.toContain(
      "\r",
    );
    const ver = readFileSync(join(espejo, "VERSION-roamgate"), "utf8");
    expect(ver).toContain(`version=${versionFuente}`);
    expect(git(["log", "-1", "--format=%s"], espejo)).toBe(
      mensajeCommit(versionFuente, r.sha),
    );
    expect(git(["tag", "--list"], espejo)).toBe(r.tag);
    expect(git(["status", "--porcelain"], espejo)).toBe("");
  }, 60_000);

  test("aborta si el tag ya existe", () => {
    const espejo = espejoNuevo("tag");
    git(["commit", "-q", "--allow-empty", "-m", "inicio"], espejo);
    git(["tag", nombreTag(versionFuente)], espejo);
    expect(() =>
      publicar(
        { espejo, push: false, permitirSucio: true },
        repo,
        dependenciasFalsas(versionFuente),
      ),
    ).toThrow("ya existe");
  });

  test("aborta si el espejo no es un repo git, o es una subcarpeta de otro", () => {
    const suelta = join(base, "suelta");
    mkdirSync(suelta, { recursive: true });
    expect(() =>
      publicar(
        { espejo: suelta, push: false, permitirSucio: true },
        repo,
        dependenciasFalsas(versionFuente),
      ),
    ).toThrow("no es un repo git");

    const sub = join(espejoNuevo("padre"), "sub");
    mkdirSync(sub);
    expect(() =>
      publicar(
        { espejo: sub, push: false, permitirSucio: true },
        repo,
        dependenciasFalsas(versionFuente),
      ),
    ).toThrow("no es un repo git");
  });

  test("aborta si el binario no reporta la version que se publica", () => {
    const espejo = espejoNuevo("version");
    expect(() =>
      publicar(
        { espejo, push: false, permitirSucio: true },
        repo,
        dependenciasFalsas("0.0.1"),
      ),
    ).toThrow("no reporta la version");
    expect(existsSync(join(espejo, BUNDLE))).toBe(false);
  });

  test("--push exige estar en main", () => {
    const espejo = espejoNuevo("rama");
    git(["checkout", "-q", "-b", "otra"], espejo);
    expect(() =>
      publicar(
        { espejo, push: true, permitirSucio: true },
        repo,
        dependenciasFalsas(versionFuente),
      ),
    ).toThrow("--push exige");
  });
});
