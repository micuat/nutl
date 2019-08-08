(
SynthDef(\pop, { |out=0, t_trig=0, attack=0.01, decay=0.08, doneAction=0, amp=0.1|
	var pitch, son;
	amp   = amp * EnvGen.ar(Env.perc(attack, decay).delay(0.003), t_trig, doneAction: doneAction);
	pitch = exp(Latch.ar(WhiteNoise.ar, Impulse.ar(16)) * 16).floor / 16 * 50 + 1560;

	son = SinOsc.ar(pitch);
	// high-pass to remove any lowpitched artifacts, scale amplitude
	son = son * amp * 10;
	son = FreeVerb.ar(son, mix: 0.5, damp: 0.4, room: 0.58);
	Out.ar([0, 1], son);
}).add;
)

x = Synth(\pop);
x.set(\t_trig, 1, \freq,1000); // run this line multiple times, to get multiple (very similar) bubbles!
x.free;
