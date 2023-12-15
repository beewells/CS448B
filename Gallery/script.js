
let pieChart1, pieChart2, pieChart3;

const boyGroupColors = [
    "#c7e9b4", "#41b6c4", "#1d91c0", "#41b6c4", // Cyan
    "#7fcdbb", // Pale turquoise
   " #2c7fb8", // Sky blue
    "#41b6c4", 
  ];
  
  const girlGroupColors = [
    "#ffeda0", "#fed976", "#feb24c", "#feb24c", // Macaroni and Cheese
    "#fd8d3c", // Pumpkin
    "#ffa500",
    "#ffd700", // Gold

  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true, // Set to true to maintain the aspect ratio
    aspectRatio: 1, // You can set your desired aspect ratio
    legend: {
        legend: {
            display: true,
            position: 'bottom', // Positions the legend at the bottom
            labels: {
                boxWidth: 20, // Adjust box width to your preference
                fontColor: '#333',
                fontFamily: "'Merriweather', serif", // Apply the Merriweather font
                padding: 20 // Adjust padding to space out items
            }
        },
    },
    title: {
      display: true,
      text: 'Distribution',
      fontColor: '#333',
      fontSize: 16
    }, 
    tooltips: {
        enabled: true,
        mode: 'single',
        callbacks: {
          // Modify the title of the tooltip
          title: function(tooltipItem, data) {
            // Access the label of the hovered item
            return data.labels[tooltipItem[0].index];
          },
          // Modify the body of the tooltip
          label: function(tooltipItem, data) {
            // Access the hovered dataset
            const dataset = data.datasets[tooltipItem.datasetIndex];
            // Get the value of the hovered item
            const value = dataset.data[tooltipItem.index];
            // Calculate the percentage
            const total = dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(2); // toFixed(2) for two decimal places
            
            // Return the label for the tooltip
            return `Percentage: ${percentage}%`;
          }
        },
        backgroundColor: '#000',
        titleFontSize: 16,
        titleFontColor: '#0066ff',
        bodyFontColor: '#000',
        bodyFontSize: 14,
        displayColors: false, // Set to false to hide the small color box next to the tooltip text
        borderColor: 'gray',
        borderWidth: 1
      }
  };
  
  

  
// Function to create and insert gallery rows and items
function populateGallery(albumData) {
    const gallery = document.getElementById('album-gallery');
    gallery.innerHTML = ''; // Clear existing content

    // Calculate the number of items per row for two rows
    const itemsPerRow = Math.ceil(albumData.length / 3);

    // Create and populate two rows with gallery items
    for (let rowNumber = 0; rowNumber < 3; rowNumber++) {
        const row = document.createElement('div');
        row.className = 'gallery-row';
        
        // Get a slice of the album data for the current row
        const rowAlbumData = albumData.slice(rowNumber * itemsPerRow, (rowNumber + 1) * itemsPerRow);
        
        // Create and append gallery items to the row
        rowAlbumData.forEach(item => {
            // Create an anchor element for the Spotify URL
            const anchorElement = document.createElement('a');
            anchorElement.href = item['Album URL']; // Replace with the actual property name containing the Spotify URL
            anchorElement.target = '_blank'; // To open in a new tab

            const itemElement = document.createElement('div');
            itemElement.className = 'gallery-item';
            itemElement.style.backgroundImage = `url('${item['Album Cover URL']}')`;

            // Create a title overlay element
            const titleOverlayElement = document.createElement('div');
            titleOverlayElement.className = 'album-title-overlay';

            // Create a title text element
            const titleTextElement = document.createElement('div');
            titleTextElement.className = 'album-title-text';
            titleTextElement.textContent = item['Album Title'];

            // Append the text to the overlay, and the overlay to the item
            titleOverlayElement.appendChild(titleTextElement);
            itemElement.appendChild(titleOverlayElement);

            // Wrap the item with the anchor element
            anchorElement.appendChild(itemElement);
            row.appendChild(anchorElement);
        });

        // Append the row to the gallery
        gallery.appendChild(row);
    }
}



document.addEventListener('DOMContentLoaded', function() {
    fetchAlbumData();

    // Set up event listeners for the filters
    document.getElementById('start-date').addEventListener('change', filterAlbums);
    document.getElementById('end-date').addEventListener('change', filterAlbums);
    document.getElementById('warm-cool-neutral').addEventListener('change', filterAlbums);
    document.getElementById('series-or-not').addEventListener('change', filterAlbums);
    document.getElementById('people').addEventListener('change', filterAlbums);

    initializePieCharts();
});

function fetchAlbumData() {
    return fetch('AlbumData.json')
        .then(response => response.json())
        .then(data => {
            window.albumData = data; // Save the full data set in a variable for use in filtering
            populateGallery(data);
            return data; // Return the data for further processing
        })
        .catch(error => {
            console.error('Error loading album data:', error);
            return []; // Return an empty array in case of error
        });
}


function filterAlbums() {
    const startDate = document.getElementById('start-date').value ? new Date(document.getElementById('start-date').value) : null;
    const endDate = document.getElementById('end-date').value ? new Date(document.getElementById('end-date').value) : null;
    const warmCoolNeutral = document.getElementById('warm-cool-neutral').value;
    const seriesOrNot = document.getElementById('series-or-not').value;
    const people = document.getElementById('people').value;

    // Filter the data based on the selections
    const filteredData = window.albumData.filter(item => {
        const releaseDate = new Date(item['Release Year'], new Date(Date.parse(item['Release Month'] + " 1, 2012")).getMonth(), item['Release Date']);
        const isWithinDateRange = (!startDate || releaseDate >= startDate) && (!endDate || releaseDate <= endDate);
        const isWarmCoolNeutralMatch = warmCoolNeutral === "" || (item['Warm vs Cool vs Neutral'] && item['Warm vs Cool vs Neutral'].toLowerCase() === warmCoolNeutral.toLowerCase());
        const isSeriesOrNotMatch = seriesOrNot === "" || Number(item['Series or Not']) === Number(seriesOrNot);
        const isPeopleMatch = people === "" || Number(item['People']) === Number(people);

        return isWithinDateRange && isWarmCoolNeutralMatch && !isSeriesOrNotMatch && isPeopleMatch;
    });

    const aggregatedData = aggregateDataForCharts(filteredData);
    updatePieCharts(aggregatedData);
    populateGallery(filteredData);
}

function aggregateDataForCharts(filteredData) {
    const result = {
        boyGroups: {
            Warm: 0,
            Cool: 0,
            Neutral: 0,
            Series: 0,
            NotSeries: 0,
            PeopleOnCover: 0,
            NoPeopleOnCover: 0
        },
        girlGroups: {
            Warm: 0,
            Cool: 0,
            Neutral: 0,
            Series: 0,
            NotSeries: 0,
            PeopleOnCover: 0,
            NoPeopleOnCover: 0
        }
    };

    // Aggregate data
    filteredData.forEach(item => {
        const type = item['Group Type'];
        const category = item['Warm vs Cool vs Neutral'];
        const series = item['Series or Not'] ? 'Series' : 'NotSeries';
        const people = item['People'] ? 'PeopleOnCover' : 'NoPeopleOnCover';
        
        if (type === 'Boy') {
            result.boyGroups[category]++;
            result.boyGroups[series]++;
            result.boyGroups[people]++;
        } else if (type === 'Girl') {
            result.girlGroups[category]++;
            result.girlGroups[series]++;
            result.girlGroups[people]++;
        }
    });

    return result;
}

// You need to implement this function based on your logic to determine if it's a boy or girl group
function determineGroupType(groupName) {
    // Placeholder logic to determine group type
    // Implement your actual logic here
    return groupName.includes('Boy') ? 'Boy' : 'Girl';
}

function initializePieCharts(aggregatedData) {
    // Initialize pieChart1 with boy group and girl group data based on temperature
    pieChart1 = new Chart(document.getElementById('pieChart1').getContext('2d'), {
      type: 'pie',
      data: {
        labels: ['Warm', 'Cool', 'Neutral'],
        datasets: [
          {
            label: 'Boy Groups',
            data: [
              aggregatedData.boyGroups.Warm, 
              aggregatedData.boyGroups.Cool, 
              aggregatedData.boyGroups.Neutral
            ],
            backgroundColor: boyGroupColors.slice(0, 3) // Take first 3 colors
          },
          {
            label: 'Girl Groups',
            data: [
              aggregatedData.girlGroups.Warm, 
              aggregatedData.girlGroups.Cool, 
              aggregatedData.girlGroups.Neutral
            ],
            backgroundColor: girlGroupColors.slice(0, 3) // Take first 3 colors
          }
        ]
      },
      options: chartOptions
    });
  
    // Initialize pieChart2 with data on whether the albums are part of a series or not
    pieChart2 = new Chart(document.getElementById('pieChart2').getContext('2d'), {
      type: 'pie',
      data: {
        labels: ['Not Part of a Series', 'Part of a Series'],
        datasets: [
          {
            label: 'Boy Groups',
            data: [
              aggregatedData.boyGroups.Series, 
              aggregatedData.boyGroups.NotSeries
            ],
            backgroundColor: boyGroupColors.slice(3, 5) // Take next 2 colors
          },
          {
            label: 'Girl Groups',
            data: [
              aggregatedData.girlGroups.Series, 
              aggregatedData.girlGroups.NotSeries
            ],
            backgroundColor: girlGroupColors.slice(3, 5) // Take next 2 colors
          }
        ]
      },
      options: 
      {
        chartOptions,
        
      }
    });
  
    // Initialize pieChart3 with data on whether the albums have people on the cover
    pieChart3 = new Chart(document.getElementById('pieChart3').getContext('2d'), {
      type: 'pie',
      data: {
        labels: ['People on Cover', 'No People on Cover'],
        datasets: [
          {
            label: 'Boy Groups',
            data: [
              aggregatedData.boyGroups.PeopleOnCover, 
              aggregatedData.boyGroups.NoPeopleOnCover
            ],
            backgroundColor: boyGroupColors.slice(5, 7) // Take next 2 colors
          },
          {
            label: 'Girl Groups',
            data: [
              aggregatedData.girlGroups.PeopleOnCover, 
              aggregatedData.girlGroups.NoPeopleOnCover
            ],
            backgroundColor: girlGroupColors.slice(5, 7) // Take next 2 colors
          }
        ]
      },
      options: chartOptions
    });
  }

  function updatePieCharts(aggregatedData) {
    // Update pieChart1
    pieChart1.data.datasets[0].data = [
      aggregatedData.boyGroups.Warm,
      aggregatedData.boyGroups.Cool,
      aggregatedData.boyGroups.Neutral
    ];
    pieChart1.data.datasets[1].data = [
      aggregatedData.girlGroups.Warm,
      aggregatedData.girlGroups.Cool,
      aggregatedData.girlGroups.Neutral
    ];
    pieChart1.data.datasets[0].backgroundColor = boyGroupColors.slice(0, 3);
    pieChart1.data.datasets[1].backgroundColor = girlGroupColors.slice(0, 3);
    pieChart1.options = chartOptions;
    pieChart1.update();
  
    // Update pieChart2
    pieChart2.data.datasets[0].data = [
      aggregatedData.boyGroups.Series,
      aggregatedData.boyGroups.NotSeries
    ];
    pieChart2.data.datasets[1].data = [
      aggregatedData.girlGroups.Series,
      aggregatedData.girlGroups.NotSeries
    ];
    pieChart2.data.datasets[0].backgroundColor = boyGroupColors.slice(3, 5);
    pieChart2.data.datasets[1].backgroundColor = girlGroupColors.slice(3, 5);
    pieChart2.options = chartOptions;
    pieChart2.update();
  
    // Update pieChart3
    pieChart3.data.datasets[0].data = [
      aggregatedData.boyGroups.PeopleOnCover,
      aggregatedData.boyGroups.NoPeopleOnCover
    ];
    pieChart3.data.datasets[1].data = [
      aggregatedData.girlGroups.PeopleOnCover,
      aggregatedData.girlGroups.NoPeopleOnCover
    ];
    pieChart3.data.datasets[0].backgroundColor = boyGroupColors.slice(5, 7);
    pieChart3.data.datasets[1].backgroundColor = girlGroupColors.slice(5, 7);
    pieChart3.options = chartOptions;
    pieChart3.update();
  }
  

function areFiltersDefault() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const warmCoolNeutral = document.getElementById('warm-cool-neutral').value;
    const seriesOrNot = document.getElementById('series-or-not').value;
    const people = document.getElementById('people').value;

    // Assuming the default values for your filters
    return !startDate && !endDate && warmCoolNeutral === "" && seriesOrNot === "" && people === "";
}

// Function to reset the charts to their initial state
function resetCharts() {
    const initialAggregatedData = aggregateDataForCharts(window.albumData);
    updatePieCharts(initialAggregatedData);
    populateGallery(window.albumData);
}


document.addEventListener('DOMContentLoaded', function() {
    fetchAlbumData().then(() => {
        // Assuming fetchAlbumData is now correctly fetching and returning the data
        // and aggregateDataForCharts is correctly aggregating it
        const aggregatedData = aggregateDataForCharts(window.albumData);
        initializePieCharts(aggregatedData); // Initialize the charts with the data
    });

    // Set up event listeners for the filters
    document.getElementById('start-date').addEventListener('change', filterAndUpdate);
    document.getElementById('end-date').addEventListener('change', filterAndUpdate);
    document.getElementById('warm-cool-neutral').addEventListener('change', filterAndUpdate);
    document.getElementById('series-or-not').addEventListener('change', filterAndUpdate);
    document.getElementById('people').addEventListener('change', filterAndUpdate);

    startAutoScroll();
});



function filterAndUpdate() {
    if (areFiltersDefault()) {
        resetCharts();
    } else {
        const filteredData = filterAlbums();
        const aggregatedData = aggregateDataForCharts(filteredData);
        updatePieCharts(aggregatedData);
        populateGallery(filteredData);
    }
}

function startAutoScroll() {
    const gallery = document.getElementById('album-gallery');
    let isHovered = false; // Track whether the mouse is hovering over the gallery
    const step = 1; // The number of pixels to scroll at a time
    const speed = 30; // The time in milliseconds between each step

    function stepScroll() {
        if (!isHovered) { // Only scroll if the gallery is not being hovered over
            if (gallery.scrollLeft < gallery.scrollWidth - gallery.clientWidth) {
                gallery.scrollLeft += step;
            } else {
                gallery.scrollLeft = 0; // Reset to the start if you've reached the end
            }
        }
        setTimeout(stepScroll, speed);
    }

    // Listen for hover events to pause and resume auto-scroll
    gallery.addEventListener('mouseenter', function() {
        isHovered = true;
    });

    gallery.addEventListener('mouseleave', function() {
        isHovered = false;
    });

    stepScroll(); // Start the auto-scrolling
}
