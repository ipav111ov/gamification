//   const headerFields2 = () => {
//     return {
//       [TYPES_OF_ORDERS.fp]: factoryNormalBig(),
//       [TYPES_OF_ORDERS.esx]: factoryNormalBig()
//     };
//   };
//   let arrayForWrite = [
//     [
//       programName, '', '', '',
//       'Points', '', '', '',
//       '', '', '', '',
//       'FP', '', '', '', '', '', '', '', '', '',
//       '', '', '', '', '',
//       '', '', '', '', '', '', '', '', '', '',
//       '', '', '', '', '',
//       'ESX', '', '', '', '', '', '', '', '', '', '', '', '', '',
//       '', '', '', '', '',
//       '', '', '', '', '', '', '', '', '', '', '', '', '', '',
//       '', '', '', '', '',
//     ],
//     [
//       time, '', '', '',
//       'FP Points', '', '', '',
//       'ESX Points', '', '', '',
//       'FP Normal', '', '', '', '', '', '', '', '', '',
//       '', '', '', '', '',
//       'FP Big', '', '', '', '', '', '', '', '', '',
//       '', '', '', '', '',
//       'ESX Normal', '', '', '', '', '', '', '', '', '', '', '', '', '',
//       '', '', '', '', '',
//       'ESX Big', '', '', '', '', '', '', '', '', '', '', '', '', '',
//       '', '', '', '', '',
//     ],
//     [
//       '', '', '', '',
//       'Normal', '',
//       'Big', '',
//       'Normal', '',
//       'Big', '',
//       'Drawing', '', '', '', '', '', '', '', '', '',
//       'Review', '', '', '', '',
//       'Drawing', '', '', '', '', '', '', '', '', '',
//       'Review', '', '', '', '',
//       'Drawing', '', '', '', '', '', '', '', '', '', '', '', '', '',
//       'Review', '', '', '', '',
//       'Drawing', '', '', '', '', '', '', '', '', '', '', '', '', '',
//       'Review', '', '', '', '',
//     ],
//     ['Uid', 'Name', 'Time', 'Total Points',]
//   ];

//   for (let i = 0; i < 4; i++) {
//     const keysFpOrEsx = Object.values(factoryPointsOutput());
//     arrayForWrite[3] = arrayForWrite[3].concat(keysFpOrEsx);
//   };

//   for (const fpOrEsx of PROGRAMS_SHEET.fpOrEsxKeysList) {
//     for (const normalBig of PROGRAMS_SHEET.normalBigKeysList) {
//       const programDrawing = headerFields2()[fpOrEsx][normalBig][programName];
//       const keysDrawing = fpOrEsx === TYPES_OF_ORDERS.fp ? Object.keys(factoryOutputFp(programDrawing)) : Object.keys(factoryOutputEsx(programDrawing));
//       const keysReview = Object.keys(factoryOutputReview(programDrawing));
//       arrayForWrite[3] = arrayForWrite[3].concat(getExcludedZeros(keysDrawing), getExcludedZeros(keysReview),);
//     };
//   };
