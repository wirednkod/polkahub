import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";

const commonOptions = {
  input: "src/index.ts",
  external: (id) => !/^[./]/.test(id) && !/^@\//.test(id),
};

export default [
  {
    ...commonOptions,
    plugins: [esbuild()],
    output: [
      {
        dir: `dist`,
        format: "es",
        sourcemap: true,
        preserveModules: true,
        entryFileNames: "[name].js",
      },
    ],
  },
  {
    ...commonOptions,
    plugins: [dts()],
    output: {
      file: `dist/index.d.ts`,
      format: "es",
    },
  },
];
