import { describe, expect, it } from "vitest";
import { GET as searchFoods } from "../app/api/foods/search/route";
import { GET as searchExercises } from "../app/api/exercises/search/route";

describe("HTTP search endpoints", () => {
  it("returns normalized food results", async () => {
    const response = searchFoods(new Request("http://localhost/api/foods/search?q=chicken"));
    expect(response.status).toBe(200);
    expect((await response.json()).foods[0].name).toBe("Chicken breast bowl");
  });

  it("returns normalized exercise results", async () => {
    const response = searchExercises(new Request("http://localhost/api/exercises/search?q=run"));
    expect(response.status).toBe(200);
    expect((await response.json()).exercises[0].name).toBe("Zone 2 run");
  });
});
