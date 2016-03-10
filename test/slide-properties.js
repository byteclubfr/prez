import test from "ava";
import extractProps from "../lib/slide-properties";

test.beforeEach(t => {
  t.context.slides = [
    "foo",
    "foo\nbar",
    "foo\nNote: bar",
    "$prop:value$\nfoo",
    "$prop:value$\nfoo\nbar"
  ];
});

test("extractProps should return an object with content", t => {
  t.context.slides.forEach(slide => {
    const result = extractProps(slide);

    t.is(typeof result, "object");
    t.is(typeof result.content, "string");
  });
});

test("extractProps should return content without props", t => {
  const s = t.context.slides;
  const result0 = extractProps(s[0]);
  t.is(result0.content, s[0]);

  const result3 = extractProps(s[3]);
  t.is(result3.content, s[3].split("\n")[1]);
});

test("extractProps should return correct has-notes DOM flag", t => {
  const s = t.context.slides;
  const result0 = extractProps(s[0]);
  t.is(result0.datas["has-notes"], "false");

  const result2 = extractProps(s[2]);
  t.is(result2.datas["has-notes"], "true");
});
