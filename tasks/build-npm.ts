import { build, emptyDir } from "https://deno.land/x/dnt@0.38.1/mod.ts"

const outDir = "./build/npm"

await emptyDir(outDir)
await emptyDir(outDir + "/assets")

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
  mappings: {
    "https://esm.sh/react@18.2.0": {
      name: "react",
      version: "^18.2.0",
      peerDependency: true,
    },
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
      url: "git+https://github.com/PetrosiliusPatter/use-worker-timer.git",
    },
    bugs: {
      url: "https://github.com/PetrosiliusPatter/use-worker-timer/issues",
    },
    engines: {
      node: ">= 14",
    },
    devDependencies: {
      "@types/react": "18.2.0",
      "react": "18.2.0",
    },
  },
})

// Copies the readme
await Deno.copyFile("README.md", `${outDir}/README.md`)
await Deno.copyFile("assets/icon.png", `${outDir}/assets/icon.png`)
