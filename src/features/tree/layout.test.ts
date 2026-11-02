import { describe, expect, it } from "vitest";
import type { Member, Relationship } from "@/types/database";
import { layoutFamilyTree } from "./layout";

function member(id: string, first = id): Member {
  return {
    id,
    family_id: "f1",
    member_code: id,
    member_type: "real",
    first_name: first,
    middle_name: null,
    last_name: null,
    display_name: null,
    gender: null,
    date_of_birth: null,
    date_of_death: null,
    is_deceased: false,
    email: null,
    phone: null,
    location: null,
    biography: null,
    occupation: null,
    notes: null,
    created_by: null,
    created_at: "",
    updated_at: ""
  };
}

function rel(
  id: string,
  type: Relationship["relationship_type"],
  source: string,
  target: string
): Relationship {
  return {
    id,
    family_id: "f1",
    relationship_type: type,
    relationship_status: "active",
    source_member_id: source,
    target_member_id: target,
    start_date: null,
    end_date: null,
    created_by: null,
    created_at: "",
    updated_at: ""
  };
}

describe("layoutFamilyTree", () => {
  it("places a solo member", () => {
    const coords = layoutFamilyTree([member("a")], []);
    expect(coords.a).toEqual({ x: expect.any(Number), y: 40 });
  });

  it("places partners side by side on same generation", () => {
    const coords = layoutFamilyTree(
      [member("a"), member("b")],
      [rel("r1", "partner", "a", "b")]
    );
    expect(coords.a.y).toBe(coords.b.y);
    expect(Math.abs(coords.a.x - coords.b.x)).toBeGreaterThan(40);
  });

  it("places child below parents", () => {
    const coords = layoutFamilyTree(
      [member("p"), member("c")],
      [rel("r1", "parent", "p", "c")]
    );
    expect(coords.c.y).toBeGreaterThan(coords.p.y);
  });

  it("ignores ended relationships", () => {
    const ended: Relationship = {
      ...rel("r1", "partner", "a", "b"),
      relationship_status: "ended"
    };
    const coords = layoutFamilyTree([member("a"), member("b")], [ended]);
    expect(coords.a).toBeDefined();
    expect(coords.b).toBeDefined();
    // Without active partner link they may still both place as roots
    expect(Object.keys(coords)).toHaveLength(2);
  });
});
