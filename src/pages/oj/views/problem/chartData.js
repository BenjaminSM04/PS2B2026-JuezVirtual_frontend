/*const pieColorMap = {
  'AC': {color: '#19be6b'},
  'WA': {color: '#ed3f14'},
  'TLE': {color: '#ff9300'},
  'MLE': {color: '#f7de00'},
  'RE': {color: '#ff6104'},
  'CE': {color: '#80848f'},
  'PAC': {color: '#2d8cf0'}
}*/

const pieColorMap = {
  'AC':  { color: '#7B1E3A' }, // vino principal
  'WA':  { color: '#987284' }, // rosa viejo
  'TLE': { color: '#C9ADA7' }, // beige rosado
  'MLE': { color: '#003B4A' }, 
  'RE':  { color: '#BDF2D4' }, // terracota
  'CE':  { color: '#6D6875' }, // gris morado
  'PAC': { color: '#4A4E69' }  // azul gris
}

function getItemColor (obj) {
  return pieColorMap[obj.name].color
}

const pie = {
  legend: {
    left: 'center',
    top: '10',
    orient: 'horizontal',
    data: ['AC', 'WA']
  },
  series: [
    {
      name: 'Summary',
      type: 'pie',
      radius: '80%',
      center: ['50%', '55%'],
      itemStyle: {
        normal: {color: getItemColor}
      },
      data: [
        {value: 0, name: 'WA'},
        {value: 0, name: 'AC'}
      ],
      label: {
        normal: {
          position: 'inner',
          show: true,
          formatter: '{b}: {c}\n {d}%',
          textStyle: {
            fontWeight: 'bold'
          }
        }
      }
    }
  ]
}

const largePie = {
  legend: {
    left: 'center',
    top:
      '10',
    orient:
      'horizontal',
    itemGap:
      20,
    data:
      ['AC', 'RE', 'WA', 'TLE', 'PAC', 'MLE']
  },
  series: [
    {
      name: 'Detail',
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '55%'],
      itemStyle: {
        normal: {color: getItemColor}
      },
      data: [
        {value: 0, name: 'RE'},
        {value: 0, name: 'WA'},
        {value: 0, name: 'TLE'},
        {value: 0, name: 'AC'},
        {value: 0, name: 'MLE'},
        {value: 0, name: 'PAC'}
      ],
      label: {
        normal: {
          formatter: '{b}: {c}\n {d}%'
        }
      },
      labelLine: {
        normal: {}
      }
    },
    {
      name: 'Summary',
      type: 'pie',
      radius: '30%',
      center: ['50%', '55%'],
      itemStyle: {
        normal: {color: getItemColor}
      },
      data: [
        {value: '0', name: 'WA'},
        {value: 0, name: 'AC', selected: true}
      ],
      label: {
        normal: {
          position: 'inner',
          formatter: '{b}: {c}\n {d}%'
        }
      }
    }
  ]
}

export { pie, largePie }
