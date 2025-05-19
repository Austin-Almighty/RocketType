"use client";
import KeyboardListener from "../_lib/keypressLightup";

export default function Keyboard() {
    KeyboardListener();
  return (
    <div className="absolute top-[80vh]">
      <div className="my-1 flex w-full justify-center gap-2">
        <kbd className="kbd bg-blue-950" id="q">q</kbd>
        <kbd className="kbd bg-blue-950" id="w">w</kbd>
        <kbd className="kbd bg-blue-950" id="e">e</kbd>
        <kbd className="kbd bg-blue-950" id="r">r</kbd>
        <kbd className="kbd bg-blue-950" id="t">t</kbd>
        <kbd className="kbd bg-blue-950" id="y">y</kbd>
        <kbd className="kbd bg-blue-950" id="u">u</kbd>
        <kbd className="kbd bg-blue-950" id="i">i</kbd>
        <kbd className="kbd bg-blue-950" id="o">o</kbd>
        <kbd className="kbd bg-blue-950" id="p">p</kbd>
      </div>
      <div className="my-1 flex w-full justify-center gap-2">
        <kbd className="kbd bg-blue-950" id="a">a</kbd>
        <kbd className="kbd bg-blue-950" id="s">s</kbd>
        <kbd className="kbd bg-blue-950" id="d">d</kbd>
        <kbd className="kbd bg-blue-950" id="f">f</kbd>
        <kbd className="kbd bg-blue-950" id="g">g</kbd>
        <kbd className="kbd bg-blue-950" id="h">h</kbd>
        <kbd className="kbd bg-blue-950" id="j">j</kbd>
        <kbd className="kbd bg-blue-950" id="k">k</kbd>
        <kbd className="kbd bg-blue-950" id="l">l</kbd>
      </div>
      <div className="my-1 flex w-full justify-center gap-2">
        <kbd className="kbd bg-blue-950" id="z">z</kbd>
        <kbd className="kbd bg-blue-950" id="x">x</kbd>
        <kbd className="kbd bg-blue-950" id="c">c</kbd>
        <kbd className="kbd bg-blue-950" id="v">v</kbd>
        <kbd className="kbd bg-blue-950" id="b">b</kbd>
        <kbd className="kbd bg-blue-950" id="n">n</kbd>
        <kbd className="kbd bg-blue-950" id="m">m</kbd>
        <kbd className="kbd bg-blue-950" id="/">/</kbd>
      </div>
      <div className="my-1 flex w-full justify-center">
        <kbd className="kbd bg-blue-950 w-40" id="space"></kbd>
      </div>
    </div>
 
  );
}
