
// let indicatorsNoConverter = [1.4, 1.71, 1.91, 2.14, 2.41, 2.68, 2.9, 3.27, 4.45]
// let coeficientsNoConverter = [1.4, 1.3, 1.2, 1.1, 1, 0.9, 0.8, 0.7, 0.6, 0.5]

// let indicatorsRating = [4.5, 4.6, 4.7, 4.75, 4.8, 4.85, 4.9, 4.95, 5]
// let coeficientsRating = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4]

// let indicatorsReview = [0.49,	0.59,	0.67,	0.74	,0.84,	0.95,	1.09,	1.28,	1.88]
// let coeficientsReview = [1.4,	1.3,	1.2,	1.1,	1,	0.9,	0.8,	0.7,	0.6,	0.5]

// let indicatorsSolo = [94, 95, 96, 97, 98, 98.5, 99, 99.5, 100]
// let coeficientsSolo = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4]

// function getCoeficient() {

//   const myIndicator = 1.87

//   let indicators = [0.49,	0.59,	0.67,	0.74	,0.84,	0.95,	1.09,	1.28,	1.88]

//   let coefficients = [1.4,	1.3,	1.2,	1.1,	1,	0.9,	0.8,	0.7,	0.6,	0.5]

//   if (typeof myIndicator == 'undefined') {
//     throw Error("myIndicator is undefined")
//   }
//   const getFormattedArray = (array) => {
//     let arrayCopy = [...array]
//     arrayCopy = arrayCopy.filter(element => element !== '' && element !== 0)
//     return arrayCopy
//   };

//   const indicatorsFormattedArray = getFormattedArray(indicators);
//   const coefficientsFormattedArray = getFormattedArray(coefficients);

//   const minIndicator = indicatorsFormattedArray.at(0);
//   const maxIndicator = indicatorsFormattedArray.at(-1);
//   const minCoefficient = coefficientsFormattedArray.at(0);
//   const maxCoefficient = coefficientsFormattedArray.at(-1);

//   if (myIndicator >= maxIndicator) return console.log(maxCoefficient);
//   if (myIndicator < minIndicator) return console.log(minCoefficient);

//   for (let index = 0; index < indicatorsFormattedArray.length; index++) {

//     const currentIndicator = indicators[index];
//     const nextIndicator = indicatorsFormattedArray[index + 1] || maxIndicator;

//     if (index === 0 && myIndicator < currentIndicator) {
//       return console.log(minCoefficient)
//     } else if (currentIndicator <= myIndicator && myIndicator < nextIndicator) {
//       return console.log(coefficientsFormattedArray[index + 1])
//     } else if (index === indicators.length - 1 && currentIndicator < myIndicator) {
//       return console.log(maxCoefficient)
//     };
//   };
// };
// getCoeficient()