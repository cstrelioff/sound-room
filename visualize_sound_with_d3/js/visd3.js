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

  // inie waveData --- for waveform
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
  svg_fft = d3.select('#d3_viz_fft')
              .append('svg')
              .attr('height', HEIGHT)
              .attr('width', WIDTH);

  // create initial fft plot
  analyser.getFloatFrequencyData(freqData);
  svg_fft.selectAll('rect')
         .data(freqData)
         .enter()
         .append('rect')
         .attr('x', function (d, i) {
           return i * (WIDTH / freqData.length);
         })
         .attr('y', function(d, i) {
           return HEIGHT;
         })
         .attr('height', 0)
         .attr('width', WIDTH / freqData.length)
         .attr('fill', '#3e3f3a');

  // wave
  //
  analyser.getFloatTimeDomainData(waveData);
  svg_wave = d3.select('#d3_viz_wave')
               .append('svg')
               .attr('height', HEIGHT)
               .attr('width', WIDTH);

  svg_wave.selectAll('circle')
          .data(waveData)
          .enter()
          .append('circle')
          .attr('cx', function (d, i) {
            return i * (WIDTH / waveData.length);
          })
          .attr('cy', function(d, i) {
            return HEIGHT/2;
          })
          .attr('r', 3)
          .attr('fill', '#3e3f3a');


  function renderChart() {
    // Continuously loop and update chart with frequency data.
    requestAnimationFrame(renderChart);

    // get fft data from analyser
    analyser.getFloatFrequencyData(freqData);

    // Update d3 chart with new data.
    svg_fft.selectAll('rect')
           .data(freqData)
           .attr('y', function(d) {
              var bar_height = (d + 140)*2;
              return HEIGHT - bar_height/2;
           })
           .attr('height', function(d) {
              var bar_height = (d + 140)*2;
              return bar_height/2;
           });

    // get wave data
    analyser.getFloatTimeDomainData(waveData);

    svg_wave.selectAll('circle')
            .data(waveData)
            .attr('cy', function(d, i) {
              return HEIGHT/2 * (1 + d);
            });


    // log data
    //console.log(freqData);

  }

  // Run the loop
  renderChart();

}); // end document ready
