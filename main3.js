const margin = {top: 100, right: 20, bottom: 50, left: 50};
const width = 1160;
const height = 600;
const groups = [
  { key: 'nominees_caucasian', label: 'Caucasian or another', color: '#BFD3C1' },
  { key: 'nominees_afrodescendant', label: 'Afro-descendant', color: '#68A691' },
  { key: 'nominees_hispanic', label: 'Hispanic', color: '#EFC7C2' },
  { key: 'nominees_asian', label: 'Asian', color: '#694F5D' },
];

// Load the data here
d3.csv('./data/academy_awards_nominees.csv').then(data => {
 // console.log('orginal data', data);

  // Declare an empty array
  const dataFormatted = [];

  // Find the first and last year in the dataset
  const firstYear = +d3.min(data, d => d.year);
  const lastYear = +d3.max(data, d => d.year);

  // Populate dataFormatted with an object for each year covered by the dataset
  // Intitialize the number of nominees for each group to 0
  for (let i = firstYear; i <=  lastYear; i++) {
    dataFormatted.push({
            year: +i,
            nominees_total: 0,
            nominees_caucasian: 0,
            nominees_afrodescendant: 0,
            nominees_hispanic: 0,
            nominees_asian: 0
    });
  }
  
 console.log('data formatted after push', dataFormatted);
  // Loop through the original dataset
  data.forEach(d => {
   // console.log('Year ', d.year);
    // In dataFormatted, find the nominees breakdown with a year corresponding to d.year

    const yearBreakdown = dataFormatted.find(item => item.year == d.year);

;    // Increase the value of total nominees by one in the year breakdown
    yearBreakdown.nominees_total +=1 ;

    // Increase the value of the corresponding ethnic group by one in the year breakdown
    switch (d.ethnic_background ) {
      case '':
        yearBreakdown.nominees_caucasian += 1;
        break;
      case 'black':
        yearBreakdown.nominees_afrodescendant += 1;
        break;
      case 'hispanic':
        yearBreakdown.nominees_hispanic += 1;
        break;
      case 'asian':
        yearBreakdown.nominees_asian += 1;
        break;
    }
  });
// console.log('data formatted', dataFormatted);

  createViz(dataFormatted);
});

// Create your visualization here
const createViz = (dataFormatted) => {

  // Create scales
  const scaleColor = d3.scaleOrdinal()
    .domain(groups.map(group => group.key )) // Your domain is the different ethnic groups. You can use the keys in the groups variable to generate a new array of identifiers.
    .range(groups.map(group => group.color ) ); // Your range is an array of colors. You can use the colors in the groups variable to generate a new array of colors.

  const scaleX = d3.scaleLinear()
    .domain( [dataFormatted[0].year, dataFormatted[dataFormatted.length - 1].year] ) // The min and max years
    .range( [margin.left, width - margin.left - margin.right]) // The left and right limits of the graph on the screen
  
const maxNoms =   +d3.max(dataFormatted, d => d.nominees_total)
  const scaleY = d3.scaleLinear()
    .domain( [0, maxNoms] ) // How many nominees do we need to cover for each year?
    .range( [height - margin.bottom, margin.top]); // The bottom and top limits of the graph on the screen

  console.log('dataFormatted = ', dataFormatted);
  // Append svg element
  const svg = d3.select('#viz')
    .append('svg')
      .attr('viewbox', 0,0,width,height )
      .attr('width',  width )
      .attr('height',  height );
const myGroup = groups.map(group => group.key );
console.log(myGroup);
  // Initialize the stack generator
  const stack = d3.stack()
    .keys( myGroup )
    .order(d3.stackOrderAscending) // The smallest areas at the bottom and the largest ones at the top.
    .offset(d3.stackOffsetNone); // Applies a zero baseline.

  // Call the stack generator to produce a stack for the data
  let series = stack(dataFormatted); // Pass the data to the stack generator
  console.log('series', series);



// Initialize the area generator


const area = d3.area()
  .x(d => {
   // console.log("year = " , d.data.year);
    return scaleX(d.data.year);
  })
  .y0(d => {
  //  console.log("y value = ", d[0]);
    return scaleY(d[0]);
  })
  .y1(d => {
  //  console.log("x value = ", d[1]);
    return scaleY(d[1]);
  })
  .curve(d3.curveMonotoneX);
// Append nominees paths
const nomineesPaths = svg
.append('g')
  .attr('class', 'stream-paths')
.selectAll('path')
.data(series)
.join('path')
  .attr('d', area)
  .attr('fill', d => scaleColor(d.key));

// Append X axis
const axisBottom = d3.axisBottom(scaleX)
.tickFormat(d3.format(''))
.tickSizeOuter(0);
const xAxis = svg
.append('g')
  .attr('transform', `translate(0,${height - margin.bottom})`)
  .style('font-family', '"Oxygen", sans-serif')
  .style('font-size', '14px')
  .style('opacity', 0.7)
.call(axisBottom);
svg
.append('text')
  .attr('class', 'axis-label axis-label-x')
  .attr('x', width / 2)
  .attr('y', height - margin.bottom / 2)
  .attr('text-anchor', 'middle')
  .text('Year');

// Append Y axis
const axisLeft = d3.axisLeft(scaleY)
.tickSizeOuter(0);
const yAxis = svg
.append('g')
.attr('transform', `translate(${margin.left}, 0 )`)
  .style('font-size', '14px')
  .style('opacity', 0.7)
.call(axisLeft);
svg
.append('text')
  .attr('class', 'axis-label axis-label-y')
  .attr('x',(0 - (height - margin.top + margin.bottom)/2 ) )
  .attr('y',15   )
  .attr('text-anchor', 'middle')
  .text('Number of Nominees')
  .attr('transform', 'rotate(-90)');

 

// Append a color legend
const legend = d3.select('.legend')
.append('ul')
.selectAll('li')
.data(groups)
.join('li');
legend
.append('span')
  .attr('class', 'legend-color')
  .style('background-color', d => d.color);
legend
.append('span')
  .attr('class', 'legend-label')
  .text(d => d.label);


/*****************************************/
  /*        Milestone 2 starts here        */
  /*****************************************/
  // Add tooltip
  const tooltip = svg
  .append('g')
  .attr('class', 'tooltip-group')
  .attr('transform', `translate(${margin.left},0)`)
  .style('font-size', '14px');


const tooltipLine = tooltip
  .append('line')
  .attr('x1', 0)
  .attr('x2', 0)
  .attr('y1', height -margin.bottom +7)
  .attr('y2', 0)
  .attr('stroke', 'grey')
  .attr('stroke-dasharray', '6 4');

const tooltipYear =tooltip
  .append('text')
  .attr('x', 0)
  .attr('y', height - margin.bottom + 35)
  .style('font-size', '17px')
  .style('font-weight', 700)
  .attr('text-anchor', 'middle');

  const tooltipCeremonyTotal = tooltip
    .append('text')
  .attr('class', d=> 'ceremony-breakdown-total')
  .attr('x', 10)
  .attr('y', 10)
  .style('font-weight', 700);
  const tooltipCeremonyBreakdown = tooltip
  .append('text')
  .attr('x', 10)
  .attr('yx', 10)
  .style('font-weight', 400);

  tooltipCeremonyBreakdown
  .selectAll('tspan')
  .data(groups)
  .join('tspan')
  .attr('class', d => `ceremony-breakdown-${d.key}`)
  .attr('x', 10)
  .attr('dy',25);



  nomineesPaths.on('mousemove', event => {
   //console.log(event)
    tooltip.attr('transform', `translate(${event.offsetX}, 0)`)
  


 

    // Get the year corresponding to the x-position and set the text of the tooltip's year label
      // scaleX is a continuous scale, which means it can return any floating number
      // Since the years are integers, we need to round the value returned by the scale
      const year = Math.round(scaleX.invert(event.offsetX)); 
      tooltipYear.text(year);

    // Get the data related to the current year
    const yearlyData = dataFormatted.find(ceremony => ceremony.year === year );

    // Set the text inside the ceremony breakdown
    d3.select('.ceremony-breakdown-total').text(` ${yearlyData.nominees_total} Nomineees total`);
    d3.select('.ceremony-breakdown-nominees_caucasian').text( `${yearlyData.nominees_caucasian} Nomineees caucasian`);
    d3.select('.ceremony-breakdown-nominees_afrodescendant').text(`${yearlyData.nominees_afrodescendant} Nomineees afrodescendant`);
    d3.select('.ceremony-breakdown-nominees_hispanic').text(`${yearlyData.nominees_hispanic} Nomineees hispanic`);
    d3.select('.ceremony-breakdown-nominees_asian').text( `${yearlyData.nominees_asian} Nomineees asian`);
   
    // If the tooltip is within the last half of the graph, move the breakdown to the left. Otherwise, keep it on the right.
  
      
      if (event.offsetX > width / 2) {
        tooltipCeremonyTotal.attr('transform', `translate(  -175 , 0 )`);
        tooltipCeremonyBreakdown.attr('transform', `translate( -175 , 0 )`);
        
      } else {
        tooltipCeremonyTotal.attr('transform', `translate( 0 , 0 )`);
        tooltipCeremonyBreakdown.attr('transform', `translate( 0 , 0 )`);
      }
      
      
  });
}