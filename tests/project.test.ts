import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseExtensionManifest } from "../../../packages/cli/dist/sdk/index.js";

const root=resolve(import.meta.dirname,"..");
const blinko=resolve(root,"../../packages/cli/dist/blinko.mjs");
const run=(command:"validate"|"build")=>execFileSync(process.execPath,[blinko,"extension",command,"."],{cwd:root,encoding:"utf8"});

describe("Blinko Vault App",()=>{
  it("declares only host-owned secret capabilities",()=>{
    const source=JSON.parse(readFileSync(resolve(root,"blinko.app.json"),"utf8"));
    const manifest=parseExtensionManifest(source);
    expect(manifest).toMatchObject({
      appId:"cloud.blinko.vault",
      permissions:{required:["secrets:own:read","secrets:own:write","secrets:share"]},
      network:{domains:[]}, dataTypes:[],
      contributes:{items:[expect.objectContaining({surface:"sidebar",viewId:"vault.workspace"})]},
    });
    expect(run("validate")).toContain("Valid cloud.blinko.vault");
  });

  it("uses the Secret bridge without generic persistence or background work",()=>{
    run("build");
    const index=JSON.parse(readFileSync(resolve(root,"dist/resource-index.json"),"utf8"));
    const resource=index.resources.find((item:{id:string})=>item.id==="ui.vault.workspace");
    const html=readFileSync(resolve(root,"dist",resource.path),"utf8");
    const source=readFileSync(resolve(root,"ui/main.tsx"),"utf8");
    expect(source).toContain(".secrets");
    expect(html).toContain("revokeShare");
    expect(html).not.toContain("host.entities");
    expect(html).not.toContain("host.storage");
    expect(html).not.toContain("localStorage");
    expect(html).not.toContain("setInterval");
    expect(html).not.toMatch(/<script\b[^>]*\bsrc\s*=/i);
  },30000);
});
