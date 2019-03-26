MIDIIn.connect;
s.boot;

(
SynthDef("sik-goo", { |out, freq = 440, formfreq = 100, gate = 0.0, bwfreq = 800|
    var x;
    x = Formant.ar(
        SinOsc.kr(0.02, 0, 10, freq),
        formfreq,
        bwfreq
    );
    x = EnvGen.kr(Env.adsr, gate, Latch.kr(gate, gate)) * x;
    Out.ar(out, x!2);
}).add;
)

(
SynthDef(\pop, { |out=0, t_trig=0, attack=0.01, decay=0.08, doneAction=0, amp=0.1, freq=1000|
	var pitch, son;
	amp   = amp * EnvGen.ar(Env.perc(attack, decay).delay(0.003), t_trig, doneAction: doneAction);

	son = SinOsc.ar(pitch);
	// high-pass to remove any lowpitched artifacts, scale amplitude
	son = son * amp * 10;
	son = FreeVerb.ar(son, mix: 0.5, damp: 0.4, room: 0.58);
	Out.ar([0, 1], son);
}).add;
)


(
SynthDef(\sinamb, { |out=0, t_trig=0, attack=0.01, decay=0.08, doneAction=0, amp=0.1, freq=1000|
	var pitch, son;
	amp   = amp * EnvGen.ar(Env.perc(attack, decay).delay(0.03), t_trig, doneAction: doneAction);

	son = SinOsc.ar(freq) * LPF.ar(WhiteNoise.ar(), 200);
	// high-pass to remove any lowpitched artifacts, scale amplitude
	son = son * amp * 10;
	Out.ar([0, 1], son);
}).add;
)

(
SynthDef(\sawamb, { |out=0, t_trig=0, attack=0.01, decay=0.08, doneAction=0, amp=0.1, freq=1000|
	var pitch, son;
	amp   = amp * EnvGen.ar(Env.perc(attack, decay).delay(0.03), t_trig, doneAction: doneAction);

	son = Saw.ar(freq);
	son = LPF.ar(son, 400);
	// high-pass to remove any lowpitched artifacts, scale amplitude
	son = son * amp * 10;
	Out.ar([0, 1], son);
}).add;
)


x = Synth(\pop);
x.set(\t_trig, 1, \freq,1500); // run this line multiple times, to get multiple (very similar) bubbles!
x.free;

x = Synth(\sinamb);
x.set(\t_trig, 1, \decay, 1.0, \freq,4); // run this line multiple times, to get multiple (very similar) bubbles!
x.free;

x = Synth(\sawamb);
x.set(\t_trig, 1, \decay, 1.0, \freq,440); // run this line multiple times, to get multiple (very similar) bubbles!
x.free;



x = Synth("sik-goo");
y = Synth("sik-goo");

//set the action:
(
~noteOn = {arg src, chan, num, vel;
	if(chan==1) {
		[src, chan, num, vel].postln;
		x.set(\t_trig, 1);
		//x.set(\decay, 1);
		x.set(\freq, num.midicps / 4.0);
		//x.set(\gate, vel / 200 );
		//x.set(\formfreq, vel / 127 * 1000);
	};

	if(chan==0) {
		y.set(\freq, num.midicps / 4.0);
		y.set(\gate, vel / 200 );
		y.set(\formfreq, vel / 127 * 1000);
	};
};
MIDIIn.addFuncTo(\noteOn, ~noteOn);

~noteOff = { arg src,chan,num,vel;
	if(chan==1) {
		x.set(\gate, 0.0);
	};

	if(chan==0) {
		y.set(\gate, 0.0);
	};
};
MIDIIn.addFuncTo(\noteOff, ~noteOff);

~bend = { arg src,chan,val;
    //(val * 0.048828125).postln;
    x.set(\bwfreq, val * 0.048828125 );
};
MIDIIn.addFuncTo(\bend, ~bend);
)

//cleanup
(
MIDIIn.removeFuncFrom(\noteOn, ~noteOn);
MIDIIn.removeFuncFrom(\noteOff, ~noteOff);
MIDIIn.removeFuncFrom(\bend, ~bend);
)