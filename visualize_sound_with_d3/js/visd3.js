$(document).ready(function() {
  // setup context and audio nodes
  var audioContext = new (window.AudioContext || window.webkitAudioContext)();
  var analyser = audioContext.createAnalyser();
  var volume = audioContext.createGain();
  var oscillator = audioContext.createOscillator();

  // set init gain/volume to zero
  volume.gain.value = 0;

  // set oscilator properties
  oscillator.type = $("input[name='wave']:checked").val();
  oscillator.frequency.value = 440; // 440 hz, that's A4

  // connect nodes
  // osc -> gain -> analyser -> dest
  oscillator.connect(volume);
  volume.connect(analyser);
  analyser.connect(audioContext.destination);

  // set fftSize and smoothingTimeConstant
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.7; // default is 0.8

  // init freqData --- for FFT
  var freqData = new Float32Array(analyser.frequencyBinCount);

  // init waveData --- for waveform
  var waveData = new Float32Array(analyser.fftSize);

  // start osc
  oscillator.start(0);

  //
  // buttons
  $('#play').click(function(e) {
    e.preventDefault();
    volume.gain.value = 1.0;
  });

  $('#stop').click(function(e) {
    e.preventDefault();
    volume.gain.value = 0.0;
  });

  $("input[name='wave']").change(function(){
    oscillator.type = $(this).val();
  });

  //
  // draw chart
  var HEIGHT = 150,
      WIDTH = 400;

  // fft
  //
  analyser.getFloatFrequencyData(freqData);
  svg_fft = d3.select('#d3_viz_fft')
              .append('svg')
              .attr('height', HEIGHT)
              .attr('width', WIDTH);

  // create scales
  x_fft = d3.scale.linear()
            .domain([0, freqData.length-1])
            .range([0, WIDTH]);

  y_fft = d3.scale.linear()
              .domain([-190, -10])
              .range([HEIGHT, 0]);

  // add line 
  var line_fft = d3.svg.line()
                   .x(function(d,i) {return x_fft(i);})
                   .y(function(d) {return y_fft(d);});
  svg_fft.append("path")
         .attr("d", line_fft(freqData));

  // wave
  //
  analyser.getFloatTimeDomainData(waveData);
  svg_wave = d3.select('#d3_viz_wave')
               .append('svg')
               .attr('height', HEIGHT)
               .attr('width', WIDTH);

  // create scales
  x_wave = d3.scale.linear()
              .domain([0, waveData.length-1])
              .range([0, WIDTH]);

  y_wave = d3.scale.linear()
              .domain([-1, 1])
              .range([0, HEIGHT]);

  // add line 
  var line_wave = d3.svg.line()
                    .x(function(d,i) {return x_wave(i);})
                    .y(function(d) {return y_wave(d);});
  svg_wave.append("path")
          .attr("d", line_wave(waveData));

  // update charts using requestAnimateFrame
  function renderChart() {
    requestAnimationFrame(renderChart);

    // get fft data and update plot
    analyser.getFloatFrequencyData(freqData);
    svg_fft.selectAll("path")
           .attr("d", line_fft(freqData));

    // get wave data and update plot
    analyser.getFloatTimeDomainData(waveData);
    svg_wave.selectAll("path")
            .attr("d", line_wave(waveData));
 
  }

  // Run the loop
  renderChart();

}); // end document ready
