import { describe, it, expect } from "vitest";
import {
  pickFirstIncompleteLesson,
  pickNextLesson,
  type CurriculumNode,
} from "./curriculum";

const fixture: CurriculumNode[] = [
  {
    id: "m1",
    slug: "m1",
    order: 10,
    title: "Module 1",
    kind: "skill",
    lessons: [
      { id: "l1a", slug: "l1a", order: 10, title: "1A", moduleSlug: "m1" },
      { id: "l1b", slug: "l1b", order: 20, title: "1B", moduleSlug: "m1" },
    ],
  },
  {
    id: "m2",
    slug: "m2",
    order: 20,
    title: "Module 2",
    kind: "song",
    lessons: [
      { id: "l2a", slug: "l2a", order: 10, title: "2A", moduleSlug: "m2" },
    ],
  },
];

describe("pickFirstIncompleteLesson", () => {
  it("returns the first lesson when nothing is complete", () => {
    expect(pickFirstIncompleteLesson(fixture, new Set())).toEqual({
      moduleSlug: "m1",
      lessonSlug: "l1a",
    });
  });

  it("skips completed lessons in order", () => {
    expect(pickFirstIncompleteLesson(fixture, new Set(["l1a"]))).toEqual({
      moduleSlug: "m1",
      lessonSlug: "l1b",
    });
  });

  it("walks into the next module when the current is fully complete", () => {
    expect(
      pickFirstIncompleteLesson(fixture, new Set(["l1a", "l1b"])),
    ).toEqual({ moduleSlug: "m2", lessonSlug: "l2a" });
  });

  it("returns null when everything is complete", () => {
    expect(
      pickFirstIncompleteLesson(fixture, new Set(["l1a", "l1b", "l2a"])),
    ).toBeNull();
  });
});

describe("pickNextLesson", () => {
  it("returns the next lesson within the same module", () => {
    expect(pickNextLesson(fixture, "m1", "l1a")).toEqual({
      moduleSlug: "m1",
      lessonSlug: "l1b",
    });
  });

  it("crosses into the next module when at the last lesson of a module", () => {
    expect(pickNextLesson(fixture, "m1", "l1b")).toEqual({
      moduleSlug: "m2",
      lessonSlug: "l2a",
    });
  });

  it("returns null at the very last lesson", () => {
    expect(pickNextLesson(fixture, "m2", "l2a")).toBeNull();
  });

  it("returns null for an unknown lesson", () => {
    expect(pickNextLesson(fixture, "m1", "nope")).toBeNull();
  });
});
