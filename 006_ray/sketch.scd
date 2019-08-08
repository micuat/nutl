(
SynthDef(\pop, { |out, tfreq = 440, dfreq = 1, bpm = 120, mul = 0.22|
	var o, i;
	var s, du, tick, trig, ifreq, ringzFreq;
	var env, gen;
	ifreq = bpm / 60;
	du = Dust.ar(dfreq);
	tick = DelayN.ar(Impulse.ar(tfreq), delaytime: 60 / bpm * 0.125);
	trig = tick * (Decay.ar(du) > 0.3) + Impulse.ar(ifreq) + (DelayN.ar(Impulse.ar(ifreq), delaytime: 60 / bpm * 0.5)) * (Decay.ar(Dust.ar(ifreq * 2)) > 0.2);
	SendTrig.ar(trig, 0, 1);

	env = Env([0, 1, 0.5, 0], [0.01, 0.02, 0.02]);
    gen = EnvGen.ar(env, trig);

	ringzFreq = (Latch.ar(WhiteNoise.ar, Impulse.ar(2)) * 4).floor / 4 * 550 + 160;
	i = LPF.ar(Ringz.ar(gen, 450, 0.5), 20000);
	s = FreeVerb.ar(i * mul, mix: 0.5, damp: 0.4, room: 0.58);
	Out.ar(out, s ! 2)
}).add;

SynthDef(\sig, { |out, freq = 440, dfreq = 1, mul = 0.22, offset = 0|
	var o, i;
	var s, lfreq, bl;
	var env, gate, gen;
	i = 1;
	SendTrig.kr(Impulse.kr(dfreq), 1, i);

	env = Env([0, 1, 0.5, 0], [0.01, 0.5, 0.5]);
    gate = Impulse.kr(0.5, offset) * (Decay.ar(Dust.ar(4)) > 0.1);
    gen = EnvGen.kr(env, gate);

	s = Blip.ar(freq, 30, mul: i * mul * gen).distort;
	// bl = Blip.ar(freq, 3, mul: i * mul).distort;
	// s = Decay.ar(Impulse.ar(0.25, offset) * (Decay.ar(Dust.ar(10)) > 0.1), 3.5) * bl;
	Out.ar(out, s ! 2)
}).add;

)

(
~pop = Synth(\pop, [\tfreq, 10, \dfreq, 1.6, \mul, 0.9, \bpm, 180]);
// ~sig0 = Synth(\sig, [\freq, 60, \dfreq, 2, \mul, 0.5]);
// ~sig1 = Synth(\sig, [\freq, 80, \dfreq, 2, \mul, 0.5, \offset, 0.25]);

n = NetAddr("127.0.0.1", 7000);  // open 7000 on localhost server
o = OSCFunc({ arg msg, time;
	// [time, msg].postln;
	// msg[3].postln;
	if(msg[2] == 0, {
		n.sendMsg("/sc3p5/pop", msg[3]);
	});
	// if(msg[2] == 1, {
	// 	n.sendMsg("/sc3p5/sig", msg[3]);
	// });
	// if(msg[2] == 2, {
	// 	n.sendMsg("/sc3p5/hhat", msg[3]);
	// });
},'/tr', s.addr);
)
