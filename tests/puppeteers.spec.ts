import { test } from "@japa/runner";
import puppeteer from "puppeteer";

test.group("Puppeteer unit tests", () => {
  test("Sign in status should be false", async ({ expect }) => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto("https://discord.com/login");
    await page.waitForNetworkIdle();

    const status = !page.url().includes("login");
    console.log(page.url());
    console.log(status);

    await browser.close();

    expect(status).toBeFalsy();
  });
});

const wait = (milliseconds: number) =>
  // add arbitrary wait time to make it look more human
  new Promise((r) => setTimeout(r, milliseconds + Math.random() * 1000));
