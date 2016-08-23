import test from "ava";
import { count } from "../lib/stats";

test.beforeEach(t => {
  t.context.lists = [
    [],
    ["a", "b", "c"],
    ["a", "b", ["c", "d"]],
    ["a", "b", ["c", "d"], "e", ["f", "g", "h"]]
  ];
});

test("count should return the right number of slides", t => {
  const l = t.context.lists;
  t.is(count(l[0]).slides, 0);
  t.is(count(l[1]).slides, 3);
  t.is(count(l[2]).slides, 4);
  t.is(count(l[3]).slides, 8);
});

test("count should return the right number of chapters", t => {
  const l = t.context.lists;
  t.is(count(l[0]).chapters, 0);
  t.is(count(l[1]).chapters, 0);
  t.is(count(l[2]).chapters, 1);
  t.is(count(l[3]).chapters, 2);
});

test("count should return the right max number", t => {
  const l = t.context.lists;
  t.is(count(l[0]).max, 0);
  t.is(count(l[1]).max, 0);
  t.is(count(l[2]).max, 2);
  t.is(count(l[3]).max, 3);
});
