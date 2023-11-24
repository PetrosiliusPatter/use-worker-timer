import { build, emptyDir } from "https://deno.land/x/dnt@0.38.1/mod.ts"

const outDir = "./build/npm"

await emptyDir(outDir)

const [version] = Deno.args
if (!version) {
  throw new Error("a version argument is required to build the npm package")
}

await build({
  entryPoints: ["./index.ts"],
  outDir,
  shims: {
    deno: false,
  },
  test: false,
  compilerOptions: {
    target: "ES2020",
    sourceMap: true,
    lib: ["ES2021", "DOM"],
  },
  package: {
    // package.json properties
    name: "use-worker-timer",
    version,
    description: "React utility for running a timer in a WebWorker,\
      reports checkpoints when they have been reached.\
      Includes basic playback control.",
    license: "MIT",
    author: "PetrosiliusPatter",
    repository: {
      type: "git",
      url: "git+https://github.com/PetrosiliusPatter/WebMidiWorker.git",
    },
    bugs: {
      url: "https://github.com/PetrosiliusPatter/WebMidiWorker/issues",
    },
    engines: {
      node: ">= 14",
    },
    devDependencies: {
      "@types/react": "18.2.0",
    },
  },
})

// Copies the readme
await Deno.copyFile("README.md", `${outDir}/README.md`)
