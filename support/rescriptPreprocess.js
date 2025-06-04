import { writeFileSync, unlinkSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import path from "path";

const rescriptPackageName = "rescript-svelte";

/**
 * This is a PoC for a Svelte preprocessor that adds support for `<script lang="res">` to Svelte.
 * It is duct taped together and has some issues and limitations, but it shows the concept of how
 * to use ReScript in Svelte.
 *
 * ## Future and improvements needed
 * - The various TODO:s in the code below should be resolved via better compiler integration
 * - Svelte tooling needs to be updated to understand ReScript
 * - The ReScript editor tooling needs to understand `.svelte` files, or integrate with Svelte tooling in some other way to provide editor support for ReScript in Svelte files.
 * - We're getting `Failed to scan for dependencies from entries:` for `src/routes/+page.svelte`. There's some kind of dependency scanning in Svelte that needs to support ReScript content as well.
 */
export function rescriptPreprocess() {
  return {
    script: async ({ content, attributes, filename }) => {
      if (attributes.lang !== "res") return;

      // TODO: Guessing there's a risk that components with the exact same name will overwrite eachother when processing. Or maybe not, if this is sync.

      // Write the script content to a temporary file in `lib/svelte`
      const theFilename = path.basename(filename).replace(".svelte", ".res");
      const tempFile = join(process.cwd(), "lib/svelte", theFilename);

      try {
        // TODO: Maybe there's a way to get around having to run this mkdir every time.
        mkdirSync(join(process.cwd(), "lib/svelte"), { recursive: true });

        writeFileSync(tempFile, content);

        // Compile the temporary file in the temp svelte dir as if it was a part of the project
        // TODO: The args used here would need to be taken and tweaked from `rewatch --compiler-args` first
        // TODO: `esmodule:lib/svelte:.res.js` points out where to emit the JS file. This should be replaced by an actual mode in the compiler that outputs to stdout.
        execSync(
          `npx bsc -bs-package-name ${rescriptPackageName} -bs-package-output esmodule:lib/svelte:.res.js -I lib/ocaml ${tempFile}`,
          {
            encoding: "utf8",
          }
        );

        // Read the generated JS file
        // TODO: We should add a mode to the compiler that just emits the code to stdout instead of writing to a file.
        const output = readFileSync(
          join(
            process.cwd(),
            "lib/svelte",
            theFilename.replace(".res", ".res.js")
          ),
          {
            encoding: "utf8",
          }
        );

        // TODO: These transformations should probably be done via some fast JS source processor, if we need to do more advanced things.

        // We need to do some light transformations on the output to make it work with Svelte.
        // 1. Exports needs to be removed
        // 2. Imports need to be adjusted to point to the correct path. This is because we're compiling the script contents _outside_ of the main project, so ReScript will output absolute paths from the project root (via the set package name).
        const outputLines = output.split("\n");
        const exportsLineIndex = outputLines.findIndex((l) =>
          l.startsWith("export {")
        );

        const code = outputLines
          .slice(0, exportsLineIndex)
          .map((l) => l.replace(` from "${rescriptPackageName}"`, ` from "`))
          .join("\n");

        return {
          code,
          map: null,
        };
      } catch (err) {
        console.error(err.stderr || err.message);
        throw err;
      } finally {
        unlinkSync(tempFile);
      }
    },
  };
}
