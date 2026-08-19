import { expect, type Page, test } from "@playwright/test";

async function initializeWorkspace(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByRole("button", { name: /INITIALIZE PORTFOLIO|ENTER WORKSPACE/ }).click();
  await expect(page.getByText("Engineering Focus")).toBeVisible({ timeout: 6_000 });
}

async function openSection(page: Page, section: string, label: string): Promise<void> {
  const mobileSelect = page.getByLabel("Select workspace section");

  if (await mobileSelect.isVisible()) {
    await mobileSelect.selectOption(section);
    return;
  }

  await page.getByRole("button", { name: label, exact: true }).click();
}

test("visitor initializes workspace and runs automation simulation", async ({ page }) => {
  await initializeWorkspace(page);
  await openSection(page, "automation", "Automation Lab");
  await page.getByRole("button", { name: "Run" }).click();

  await expect(page.getByText("TEST PASSED")).toBeVisible({ timeout: 6_000 });
});

test("persisted boot state hydrates landing without mismatch overlay", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  await page.addInitScript(() => {
    window.sessionStorage.setItem("ryanos.booted", "true");
  });

  await page.goto("/");

  await expect(page.getByRole("button", { name: "ENTER WORKSPACE" })).toBeVisible();
  await expect(page.getByText("Hydration failed")).toHaveCount(0);
  expect(consoleErrors.join("\n")).not.toContain("Hydration failed");
});

test("recruiter journey reads summary, experience, project, and contact", async ({ page }) => {
  await initializeWorkspace(page);

  await expect(page.getByText("Professional Snapshot")).toBeVisible();
  await expect(page.getByText("Ryan Hidayat").first()).toBeVisible();

  await openSection(page, "experience", "Experience");
  await expect(page.getByRole("heading", { name: "Professional Timeline" })).toBeVisible();
  await expect(page.getByText("PT Jasa Marga (Persero) Tbk")).toBeVisible();

  await openSection(page, "projects", "Projects");
  await expect(
    page.getByRole("heading", { name: "Enterprise Web Automation Ecosystem" })
  ).toBeVisible();
  await page.getByRole("button", { name: /CI\/CD Quality Gates/ }).click();
  await expect(page).toHaveURL(/\/projects\/cicd-quality-gates$/);
  await expect(page.getByRole("heading", { name: "CI/CD Quality Gates" })).toBeVisible();

  await openSection(page, "contact", "Contact");
  await expect(
    page.getByRole("heading", { name: "Interested in working together?" })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "ryanhidayat123456789@gmail.com" })).toBeVisible();
});

test("engineer journey recovers locator failure", async ({ page }) => {
  await initializeWorkspace(page);
  await page.getByRole("button", { name: "engineer", exact: true }).click();

  await expect(page.getByText("Break My Automation")).toBeVisible();
  await page.getByLabel("Failure Scenario").selectOption("locator");
  await page.getByRole("button", { name: "Run" }).click();

  await expect(page.getByText("HEALED 97%")).toBeVisible({ timeout: 6_000 });
  await expect(page.getByText("TEST PASSED")).toBeVisible();
});

test("automation lab classifies API 500 without false self-healing", async ({ page }) => {
  await initializeWorkspace(page);
  await openSection(page, "automation", "Automation Lab");
  await page.getByLabel("Failure Scenario").selectOption("api");
  await page.getByRole("button", { name: "Run" }).click();

  await expect(page.getByText("TEST FAILED")).toBeVisible({ timeout: 6_000 });
  await expect(page.getByText("QUALITY GATE BLOCKED", { exact: true })).toBeVisible();
  await expect(page.getByText("SELF-HEALING NOT AVAILABLE", { exact: true })).toBeVisible();
});

test("terminal command exposes Ryan profile", async ({ page }) => {
  await initializeWorkspace(page);
  await openSection(page, "terminal", "Terminal");
  await page.getByLabel("Terminal command").fill("whoami");
  await page.keyboard.press("Enter");

  await expect(
    page.getByText("Software Development Engineer in Test (SDET) | QA Automation Engineer")
  ).toBeVisible();
});

test("terminal journey supports help, unknown command, history, and autocomplete", async ({
  page
}) => {
  await initializeWorkspace(page);
  await openSection(page, "terminal", "Terminal");
  const terminalInput = page.getByLabel("Terminal command");

  await terminalInput.fill("help");
  await page.keyboard.press("Enter");
  await expect(page.getByText(/whoami\s+Show Ryan profile\./)).toBeVisible();

  await terminalInput.fill("wat");
  await page.keyboard.press("Enter");
  await expect(page.getByText('Command not found: wat. Type "help".')).toBeVisible();

  await page.keyboard.press("ArrowUp");
  await expect(terminalInput).toHaveValue("wat");
  await page.keyboard.press("ArrowUp");
  await expect(terminalInput).toHaveValue("help");
  await page.keyboard.press("ArrowDown");
  await expect(terminalInput).toHaveValue("wat");

  await terminalInput.fill("per");
  await page.keyboard.press("Tab");
  await expect(terminalInput).toHaveValue("performance");
});

test("pipeline success journey reaches deploy", async ({ page }) => {
  await initializeWorkspace(page);
  await openSection(page, "pipeline", "Pipeline");
  await page.getByRole("button", { name: "Run" }).click();

  await expect(page.getByText("PIPELINE PASSED")).toBeVisible({ timeout: 6_000 });
  await expect(page.getByText("PASSED DEPLOY")).toBeVisible();
  await expect(
    page.getByText("Quality gate passed. Deployment can continue.", { exact: true }).first()
  ).toBeVisible();
});

test("pipeline blocks deployment when regression fails", async ({ page }) => {
  await initializeWorkspace(page);
  await openSection(page, "pipeline", "Pipeline");
  await page.getByLabel("Pipeline Scenario").selectOption("regression-failure");
  await page.getByRole("button", { name: "Run" }).click();

  await expect(
    page
      .getByText("Quality gate blocked deployment because regression test failed.", {
        exact: true
      })
      .first()
  ).toBeVisible();
  await expect(page.getByText("SKIPPED DEPLOY", { exact: true })).toBeVisible();
});

test("pipeline blocks deployment when performance gate fails", async ({ page }) => {
  await initializeWorkspace(page);
  await openSection(page, "pipeline", "Pipeline");
  await page.getByLabel("Pipeline Scenario").selectOption("performance-gate-failure");
  await page.getByRole("button", { name: "Run" }).click();

  await expect(
    page
      .getByText("Quality gate blocked deployment because performance threshold failed.", {
        exact: true
      })
      .first()
  ).toBeVisible();
  await expect(page.getByText("PIPELINE BLOCKED", { exact: true })).toBeVisible();
});

test("architecture explorer highlights connected topology nodes", async ({ page }) => {
  await initializeWorkspace(page);
  await openSection(page, "architecture", "Architecture");
  await page.getByRole("button", { name: "K6 architecture node" }).click();

  await expect(page.getByRole("button", { name: "K6 architecture node" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await expect(page.getByText("Performance & Load Testing")).toBeVisible();
  await expect(page.getByText("JMeter")).toBeVisible();
});

test("performance lab evaluates stress thresholds", async ({ page }) => {
  await initializeWorkspace(page);
  await openSection(page, "performance", "Performance");
  await page.getByLabel("Scenario").selectOption("stress");

  await expect(page.getByText("thresholds failed")).toBeVisible();
  await expect(page.getByText("4 Threshold Failures")).toBeVisible();
  await expect(page.getByText("Check Rate").first()).toBeVisible();
});

test("api playground sends portfolio endpoint request", async ({ page }) => {
  await initializeWorkspace(page);
  await openSection(page, "api", "API Lab");
  await page.getByRole("button", { name: "Send" }).click();

  await expect(page.getByText("200 OK")).toBeVisible();
  await expect(page.getByText("application/json").first()).toBeVisible();
  await expect(page.getByLabel("API response body").getByText(/Ryan Hidayat/)).toBeVisible();
});

test("test me challenge reveals preferred reasoning path", async ({ page }) => {
  await initializeWorkspace(page);
  await openSection(page, "challenge", "Test Me");
  await page.getByRole("button", { name: /Quality Gates/ }).click();
  await page.getByRole("button", { name: "Block deployment and attach evidence" }).click();

  await expect(page.getByText("preferred path")).toBeVisible();
  await expect(page.getByText("Keep quality gate rule consistent.")).toBeVisible();
});

test("workspace modes use different defaults and priorities", async ({ page }) => {
  await initializeWorkspace(page);

  await page.getByRole("button", { name: "engineer", exact: true }).click();
  await expect(page.getByText("Break My Automation")).toBeVisible();
  const mobileSelect = page.getByLabel("Select workspace section");

  if (await mobileSelect.isVisible()) {
    await expect(mobileSelect).toHaveValue("automation");
  } else {
    await expect(page.getByText("Engineering Labs").first()).toBeVisible();
  }

  await page.getByRole("button", { name: "recruiter", exact: true }).click();
  await expect(page.getByText("Professional Snapshot")).toBeVisible();

  if (await mobileSelect.isVisible()) {
    await expect(mobileSelect).toHaveValue("overview");
  } else {
    await expect(page.getByText("Recruiter Path").first()).toBeVisible();
  }
});

test("lab deep links open directly and preserve browser history", async ({ page }) => {
  await page.goto("/labs/automation");
  await expect(page.getByText("Break My Automation")).toBeVisible();
  await expect(page).toHaveURL(/\/labs\/automation$/);

  await openSection(page, "pipeline", "Pipeline");
  await expect(page.getByText("CI/CD Pipeline Simulator")).toBeVisible();
  await expect(page).toHaveURL(/\/labs\/pipeline$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/labs\/automation$/);
  await expect(page.getByText("Break My Automation")).toBeVisible();
});

test("project slug deep link opens selected case study", async ({ page }) => {
  await page.goto("/projects/performance-load-testing");

  await expect(page.getByRole("heading", { name: "Performance & Load Testing" })).toBeVisible();
  await expect(page.getByText("K6").first()).toBeVisible();

  await page.getByRole("button", { name: /CI\/CD Quality Gates/ }).click();
  await expect(page).toHaveURL(/\/projects\/cicd-quality-gates$/);
  await expect(page.getByRole("heading", { name: "CI/CD Quality Gates" })).toBeVisible();
});

test("performance deep link survives refresh", async ({ page }) => {
  await page.goto("/labs/performance");

  await expect(page.getByRole("heading", { name: "Performance Lab" })).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/\/labs\/performance$/);
  await expect(page.getByText("thresholds passed").first()).toBeVisible();
});
