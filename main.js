function main() {
  const time = moment(new Date()).tz('Asia/Tbilisi').format('ll' + ' LTS')
  const gamification = new Gamification(SS);
  const output = new Output(gamification, time);
  output.programs;
  output.total;
  output.teams;
  Logger.log('Completed');
}

class Gamification {
  constructor(spreadsheet) {
    this.spreadsheet = spreadsheet;
    this.programs = this.getPrograms();
    this.members = this.getCalculations(this.getMembers());
    this.teams = this.getTeams();
    this.totalPointsArr = factoryTotalPointsArrProgram(this.members);
    this.totalPointsArrTeam = {};
  };

  getPrograms() {
    const programs = {};
    const sheetOfPrograms = SS.getSheetByName(SHEET_NAMES.programs);
    const valuesSheetOfPrograms = sheetOfPrograms.getDataRange().getValues();

    for (let i = 5; i < valuesSheetOfPrograms.length; i++) {

      if (valuesSheetOfPrograms[i][PROGRAMS_SHEET.isEnabledIndex]) {

        programs[valuesSheetOfPrograms[i][PROGRAMS_SHEET.nameIndex]] = {};
        const program = programs[valuesSheetOfPrograms[i][PROGRAMS_SHEET.nameIndex]];
        programs[valuesSheetOfPrograms[i][PROGRAMS_SHEET.nameIndex]].isEnabled = valuesSheetOfPrograms[i][PROGRAMS_SHEET.isEnabledIndex];
        let endOfGroupIndex = PROGRAMS_SHEET.dataStartIndex;

        for (const fpOrEsx of PROGRAMS_SHEET.fpOrEsxKeysList) {
          programs[valuesSheetOfPrograms[i][PROGRAMS_SHEET.nameIndex]][fpOrEsx] = {};

          for (const normalBigReview of PROGRAMS_SHEET.normalBigKeysList) {
            programs[valuesSheetOfPrograms[i][PROGRAMS_SHEET.nameIndex]][fpOrEsx][normalBigReview] = {};
            const program = programs[valuesSheetOfPrograms[i][PROGRAMS_SHEET.nameIndex]][fpOrEsx][normalBigReview];

            for (let group in PROGRAMS_SHEET.groups) {
              program[group] = factoryCategories();

              for (let category of Object.keys(program[group])) {
                let counterIndex = PROGRAMS_SHEET.groups[group].counterIndex;
                program[group][category] = {};

                for (let j = PROGRAMS_SHEET.dataStartIndex; j < PROGRAMS_SHEET.groups[group].length + PROGRAMS_SHEET.dataStartIndex; j++) {
                  program[group][category][`${counterIndex}`] = valuesSheetOfPrograms[i][endOfGroupIndex];
                  counterIndex++;
                  endOfGroupIndex++;
                }
                counterIndex = PROGRAMS_SHEET.groups[group].counterIndex;
              };
            };
          };
        };
      };
    };
    PROGRAMS_SHEET.programs = programs;
    return programs;
  };

  getMembers() {

    const membersObj = getMapFFedbackUid(getValuesFromSS());
    const members = {};

    for (const drafterUid in membersObj) {
      const name = membersObj[drafterUid].name;
      members[drafterUid] = new Member(drafterUid, name);

      for (const order of Object.values(membersObj[drafterUid].orders)) {

        if (order.type === TYPES_OF_ORDERS.fp || order.type === TYPES_OF_ORDERS.esx) {

          let normalBig, converterOrNot;

          const square = typeof order.square == 'number' ? order.square : typeof order.square == 'string' ? order.square : 0;
          const cameras = typeof order.cameras == 'number' ? order.cameras : typeof order.cameras == 'string' ? order.cameras : 0;

          normalBig = square >= TYPES_OF_ORDERS.bigOrderReqs.square || cameras >= TYPES_OF_ORDERS.bigOrderReqs.cameras ? TYPES_OF_ORDERS.big : TYPES_OF_ORDERS.normal;

          if (order.recipient) {
            members[drafterUid].time += Number(order.st)
          }
          else if (!order.recipient && order.creator) {
            members[drafterUid].time += Number(order.reviewST)
          }
          else {
            Logger.log('!recipient !creator ?')
          };

          converterOrNot = order.type === TYPES_OF_ORDERS.esx && order.isConverter ? 'converter' : 'noConverter';

          for (const program of Object.keys(PROGRAMS_SHEET.programs)) {

            if (order.recipient) {
              members[drafterUid][order.type][normalBig][program][converterOrNot].time += Number(order.st);
              members[drafterUid][order.type][normalBig][program][converterOrNot].cameras += Number(order.cameras);
              order.recipientArray.length < 2 ? members[drafterUid][order.type][normalBig][program][converterOrNot].soloOrders++ : members[drafterUid][order.type][normalBig][program][converterOrNot].shareOrders++;
              members[drafterUid][order.type][normalBig][program].square += Formulas.getRounding(order.square);
              members[drafterUid][order.type][normalBig][program].markArray.push(Number(order.mark));
            }
            else if (!order.recipient && order.creator) {
              if (Number(order.reviewST) > 0) {
                members[drafterUid][order.type][normalBig][program].review.time += Number(order.reviewST);
                members[drafterUid][order.type][normalBig][program].review.cameras += Number(order.cameras);
                members[drafterUid][order.type][normalBig][program].review.orders++;
              }
            }
            else {
              Logger.log('!recipient !creator ?')
            };
          };
        };
      };
    };
    return members
  };

  getCalculations(members) {

    for (const drafterUid of Object.values(members)) {
      for (const fpOrEsx of PROGRAMS_SHEET.fpOrEsxKeysList) {
        for (const normalBig of Object.keys(drafterUid[fpOrEsx])) {
          for (const programName of Object.keys(PROGRAMS_SHEET.programs)) {

            const program = drafterUid[fpOrEsx][normalBig][programName];

            //SPEED
            let time, cameras

            if (program.review.time || program.review.cameras) {
              const speedIndicators = Object.values(PROGRAMS_SHEET.programs[programName][fpOrEsx][normalBig].indicators.speedReview);
              const speedCoefficients = Object.values(PROGRAMS_SHEET.programs[programName][fpOrEsx][normalBig].coefficients.speedReview);

              time = program.review.time;
              cameras = program.review.cameras;
              program.review.speed = Formulas.getSpeed(time, cameras);
              const speed = program.review.speed;
              program.review.speedCoefficient = speed ? Formulas.getCoefficient(speed, speedIndicators, speedCoefficients) : 0;

              //POINTS
              program.reviewPoints = Formulas.getPoints(program, TYPES_OF_ORDERS.review);
              drafterUid.points[fpOrEsx][normalBig][programName].review = program.reviewPoints;
            };

            for (const converterOrNot of Object.values(TYPES_OF_ORDERS.converter)) {

              if (program[converterOrNot].time) {
                const speedCategory = converterOrNot === 'converter' ? 'speedConverter' : 'speedNoConverter';
                const speedIndicators = Object.values(PROGRAMS_SHEET.programs[programName][fpOrEsx][normalBig].indicators[speedCategory]);
                const speedCoefficients = Object.values(PROGRAMS_SHEET.programs[programName][fpOrEsx][normalBig].coefficients[speedCategory]);

                time = program[converterOrNot].time;
                cameras = program[converterOrNot].cameras;
                program[converterOrNot].speed = Formulas.getSpeed(time, cameras);
                const speed = program[converterOrNot].speed;
                program[converterOrNot].speedCoefficient = speed ? Formulas.getCoefficient(speed, speedIndicators, speedCoefficients) : 0;

                //TOTAL
                const soloOrders = program[converterOrNot].soloOrders;
                const shareOrders = program[converterOrNot].shareOrders;
                program[converterOrNot].totalOrders = soloOrders + shareOrders;
              };
            };

            //RATING
            const markIndicators = Object.values(PROGRAMS_SHEET.programs[programName][fpOrEsx][normalBig].indicators.rating);
            const markCoefficients = Object.values(PROGRAMS_SHEET.programs[programName][fpOrEsx][normalBig].coefficients.rating);
            program.markAverage = Formulas.getAverage(program.markArray);
            const markAverage = program.markAverage;
            program.markCoefficient = markAverage ? Formulas.getCoefficient(markAverage, markIndicators, markCoefficients) : 0;


            //SOLO_PERCENT
            const soloPercentIndicators = Object.values(PROGRAMS_SHEET.programs[programName][fpOrEsx][normalBig].indicators.soloPercent);
            const soloPercentCoefficients = Object.values(PROGRAMS_SHEET.programs[programName][fpOrEsx][normalBig].coefficients.soloPercent);
            let totalSoloOrders = 0;
            let totalShareOrders = 0;

            for (const converterOrNot1 of Object.values(TYPES_OF_ORDERS.converter)) {
              totalSoloOrders += program[converterOrNot1].soloOrders;
              totalShareOrders += program[converterOrNot1].shareOrders;
            };
            program.soloPercent = Formulas.getSoloPercent(totalSoloOrders, totalShareOrders);
            const soloPercent = program.soloPercent;
            program.soloCoefficient = soloPercent ? Formulas.getCoefficient(soloPercent, soloPercentIndicators, soloPercentCoefficients) : 0;

            //POINTS
            program.points = Formulas.getPoints(program, '');
            drafterUid.points[fpOrEsx][normalBig][programName].drawing = program.points;
          };

        };
      };
      drafterUid.totalPointsArr = factoryTotalPointsArr(drafterUid);
    };
    return members;
  };

  getTeams() {
    Logger.log('Сборка команд ...');
    const sheetTeams = this.spreadsheet.getSheetByName(SHEET_NAMES.teams);
    const valuesTeams = sheetTeams.getDataRange().getValues().slice(1);

    const columns = {
      teamLeaderName: 0,
      teamLeaderUid: 1,
      teamMemberName: 2,
      teamMemberUid: 3,
    };
    const teams = {};
    let currentTeamLeaderUid = "";
    let teamMembersArr = []

    for (const row of valuesTeams) {
      if (row[columns.teamLeaderName] === 'Total' || row[columns.teamLeaderName] === 'Total Included') {
        continue
      };
      if (row[columns.teamLeaderUid]) {
        currentTeamLeaderUid = row[columns.teamLeaderUid];
        teams[currentTeamLeaderUid] = {};
      };
      teams[currentTeamLeaderUid][row[columns.teamMemberUid]] = {};
    };

    for (const teamLeader of Object.values(teams)) {
      for (const teamMember in teamLeader) {
        if (this.members[teamMember]) {
          teamLeader[teamMember] = this.members[teamMember]
          teamMembersArr.push(teamMember)
        } else {
          Logger.log(`В Feedback нет ${teamMember} из TeamsList`)
          delete teamLeader[teamMember]
        };
      };
    };
    Logger.log('Проверка дупликатов в командах ...');
    findDuplicates(teamMembersArr)
    return teams;
  };
};


class Output {
  constructor(gamification, time) {
    this.gamification = gamification;
    this.time = time;
  }

  get programs() {

    const header = SS.getSheetByName('Header').getDataRange();
    const headerValues = header.getValues();


    const headerFields2 = () => {
      return {
        [TYPES_OF_ORDERS.fp]: factoryNormalBig(),
        [TYPES_OF_ORDERS.esx]: factoryNormalBig()
      };
    };

    for (const programName of Object.keys(PROGRAMS_SHEET.programs)) {

      if (!SS.getSheetByName(programName)) {
        SS.insertSheet(programName)
        const rangeToPaste = SS.getSheetByName(programName).getRange(1, 1, headerValues.length, headerValues[0].length)
        header.copyTo(rangeToPaste);
        SpreadsheetApp.flush();

      };
      const sheet = SS.getSheetByName(programName);
      let arrayForWrite = [];

      // VALUES
      for (const drafterUid of Object.values(this.gamification.members)) {
        if (!drafterUid.time) {
          continue
        };
        let arr = [drafterUid.uid, drafterUid.name, drafterUid.time,];
        let totalPoints = drafterUid.totalPointsArr[programName].reduce((acc, curr) => acc += curr, 0);
        if (totalPoints === 0) {
          totalPoints = ''
        };
        arr.push(totalPoints);

        for (const fpOrEsx of PROGRAMS_SHEET.fpOrEsxKeysList) {
          for (const normalBig of Object.keys(drafterUid[fpOrEsx])) {
            let points = drafterUid.points[fpOrEsx][normalBig][programName].drawing;
            if (points === 0) {
              points = ''
            };
            let reviewPoints = drafterUid.points[fpOrEsx][normalBig][programName].review;
            if (reviewPoints === 0) {
              reviewPoints = ''
            };
            arr.push(points, reviewPoints)
          };
        };

        for (const fpOrEsx of PROGRAMS_SHEET.fpOrEsxKeysList) {
          for (const normalBig of Object.keys(drafterUid[fpOrEsx])) {
            const program = drafterUid[fpOrEsx][normalBig][programName];

            let valuesDrawing = fpOrEsx === TYPES_OF_ORDERS.fp ? Object.values(factoryOutputFp(program)) : Object.values(factoryOutputEsx(program))
            let valuesReview = Object.values(program.review);
            arr = arr.concat(getExcludedZeros(valuesDrawing), getExcludedZeros(valuesReview))
          };
        };
        arrayForWrite.push(arr);
      };
      sheet.getRange(headerValues.length + 1, 1, sheet.getLastRow(), sheet.getLastColumn()).clear();
      sheet.getRange(headerValues.length + 1, 1, arrayForWrite.length, arrayForWrite[0].length).setValues(arrayForWrite);
      sheet.getRange('A1').setValue(sheet.getSheetName());
      sheet.getRange('A2').setValue(this.time);
    }
  };

  get total() {

    const sheet = SS.getSheetByName(SHEET_NAMES.total);
    const sheetValues = sheet.getDataRange().getValues();
    let arrayForWrite = [];
    let setValues;
    if (!sheetValues[0][0] || !sheetValues[1]) {
      arrayForWrite = [
        ['Name of Program', 'Sum Points', 'Average Points', 'Q0(min)', 'Q1', 'Q2(median)', 'Q3', 'Q4(max)']
      ]
      setValues = () => {
        return sheet.getRange(sheetValues.length, 1, arrayForWrite.length, arrayForWrite[0].length).setValues(arrayForWrite)
      };
    } else {
      setValues = () => {
        return sheet.getRange(sheetValues.length + 2, 1, arrayForWrite.length, arrayForWrite[0].length).setValues(arrayForWrite);
      };
    };
    arrayForWrite.push(
      [this.time, '', '', '', '', '', '', '',],
    );

    for (const programName of Object.keys(PROGRAMS_SHEET.programs)) {
      let arr = [];
      const arrayProgram = Object.values(this.gamification.totalPointsArr[programName]);

      const sumPoints = arrayProgram.reduce((a, b) => a += b, 0);
      const averagePoints = Formulas.getAverage(arrayProgram);
      const quartilies = Formulas.getQuartile(arrayProgram);
      arr.push(sumPoints, averagePoints, quartilies.q0, quartilies.q1, quartilies.q2, quartilies.q3, quartilies.q4);
      arr = arr.map(a => Formulas.getRounding(a));
      arr.unshift(programName);
      arrayForWrite.push(arr);
    };
    setValues();
  };

  get teams() {
    for (const team of Object.keys(this.gamification.teams)) {
      this.gamification.totalPointsArrTeam[team] = factoryTotalPointsArrProgram(this.gamification.teams[team])
    };
    const sheet = SS.getSheetByName(SHEET_NAMES.teamsOutput);
    const sheetValues = sheet.getDataRange().getValues();
    let setValues;
    let arrayForWrite = []

    if (!sheetValues[0][0] || !sheetValues[1]) {
      arrayForWrite = [
        [`Name of Program`,]
      ];
      for (const team of Object.keys(this.gamification.teams)) {
        arrayForWrite[0].push(`${team} / ${Object.keys(this.gamification.teams[team]).length}`);
      };
      arrayForWrite.push(
        [this.time,]
      );
      arrayForWrite[1] = arrayForWrite[1].concat(getEmptyArray(Object.keys(this.gamification.teams).length))
      setValues = () => {
        return sheet.getRange(sheetValues.length, 1, arrayForWrite.length, arrayForWrite[0].length).setValues(arrayForWrite)
      };
    } else {
      arrayForWrite.push(
        [this.time,]
      );
      arrayForWrite[0] = arrayForWrite[0].concat(getEmptyArray(Object.keys(this.gamification.teams).length))
      setValues = () => {
        return sheet.getRange(sheetValues.length + 2, 1, arrayForWrite.length, arrayForWrite[0].length).setValues(arrayForWrite);
      };
    };

    for (const programName of Object.keys(this.gamification.programs)) {
      let arr = [programName,]
      for (const team of Object.values(this.gamification.totalPointsArrTeam)) {
        const totalPoints = team[programName].reduce((acc, curr) => acc += curr, 0)
        arr.push(totalPoints)
      };
      arrayForWrite.push(arr);
    };
    setValues();
  };
};


class Member {
  constructor(uid, name) {
    this.uid = uid;
    this.name = name;
    this.time = 0;
    this.totalPointsArr = [];
    this.points = factoryPointsFpOrEsx();
    this[TYPES_OF_ORDERS.fp] = factoryNormalBig();
    this[TYPES_OF_ORDERS.esx] = factoryNormalBig();
  };
};

// FACTORIES

const factoryTotalPointsArr = drafterUid => {
  let programs = {};
  for (const program of Object.keys(PROGRAMS_SHEET.programs)) {
    programs[program] = Formulas.getTotalPointsArr(drafterUid.points, program)
  };
  return programs;
};

const factoryTotalPointsArrProgram = members => {
  let programs = {};
  for (const programName of Object.keys(PROGRAMS_SHEET.programs)) {
    programs[programName] = Formulas.getTotalPointsArrProgram(members, programName)
  };
  return programs;
};


const factoryReviewFields = () => {
  return {
    time: 0,
    cameras: 0,
    orders: 0,
    speed: 0,
    speedCoefficient: 0,
  };
};

const factoryNormalBig = () => {
  const factoryPrograms = () => {
    const factoryFields = () => {
      const factoryConverter = () => {
        return {
          time: 0,
          cameras: 0,

          soloOrders: 0,
          shareOrders: 0,
          totalOrders: 0,

          speed: 0,
          speedCoefficient: 0,

        };
      };

      return {
        converter: factoryConverter(),
        noConverter: factoryConverter(),
        review: factoryReviewFields(),

        square: 0,
        points: 0,
        reviewPoints: 0,

        soloPercent: 0,
        soloCoefficient: 0,

        markArray: [],
        markAverage: 0,
        markCoefficient: 0,
      };
    };

    let programs = {}
    for (const program of Object.keys(PROGRAMS_SHEET.programs)) {
      programs[program] = factoryFields()
    };

    return programs;
  };

  return {
    [TYPES_OF_ORDERS.normal]: factoryPrograms(),
    [TYPES_OF_ORDERS.big]: factoryPrograms(),
  };
};

const factoryPointsFpOrEsx = () => {
  const factoryPointsNormalBig = () => {
    const factoryPointsPrograms = () => {
      let programs = {};
      for (const program of Object.keys(PROGRAMS_SHEET.programs)) {
        programs[program] = {
          drawing: 0,
          review: 0,
        };
      };
      return programs;
    };
    return {
      [TYPES_OF_ORDERS.normal]: factoryPointsPrograms(),
      [TYPES_OF_ORDERS.big]: factoryPointsPrograms(),
    };
  };

  return {
    [TYPES_OF_ORDERS.fp]: factoryPointsNormalBig(),
    [TYPES_OF_ORDERS.esx]: factoryPointsNormalBig(),
  };
};

const factoryPointsOutput = () => {
  return [
    'Drawing',
    'Review',
  ]
};

const factoryOutputFp = (program) => {
  return {
    'Time': program.noConverter.time,
    'Cameras': program.noConverter.cameras,
    'Square': program.square,
    'Orders': program.noConverter.totalOrders,
    'Speed': program.noConverter.speed,
    "Speed Coefficient": program.noConverter.speedCoefficient,
    "Solo %": program.soloPercent,
    "Solo Coefficient": program.soloCoefficient,
    'Mark Average': program.markAverage,
    "Mark Coefficent": program.markCoefficient,
  };
};

const factoryOutputEsx = (program) => {
  return {
    'Time': program.noConverter.time + program.converter.time,
    'Cameras': program.noConverter.cameras + program.converter.cameras,
    'Square': program.square,
    'Total Orders': program.noConverter.totalOrders + program.converter.totalOrders,
    'Orders ': program.noConverter.totalOrders,
    'Orders Converter': program.converter.totalOrders,
    'Speed': program.noConverter.speed,
    "Speed Coefficient": program.noConverter.speedCoefficient,
    'Speed Converter': program.converter.speed,
    "Speed Coefficient Converter": program.converter.speedCoefficient,
    "Solo %": program.soloPercent,
    "Solo Coefficient": program.soloCoefficient,
    'Mark Average': program.markAverage,
    "Mark Coefficent": program.markCoefficient,
  };
};

const factoryOutputReview = (program) => {
  return {
    'Time': program.review.time,
    'Cameras': program.review.cameras,
    "Orders": program.review.orders,
    "Speed": program.review.speed,
    "Speed Coefficient": program.review.speedCoefficient,
  };
};


const getExcludedZeros = (array) => {
  const newArray = array.map(value => value === 0 ? '' : value)
  return newArray
};

const getEmptyArray = (number) => {
  const array = []
  for (let i = 0; i < number; i++) {
    array.push('')
  };
  return array
};

// Дупликаты массив
function findDuplicates(array) {
  const duplicates = [];
  const seen = {};

  for (let i = 0; i < array.length; i++) {
    const currentItem = array[i];
    if (seen[currentItem]) {
      if (!duplicates.includes[currentItem]) {
        duplicates.push(currentItem)
      }
    } else {
      seen[currentItem] = true;
    };
  }
  duplicates.length > 0 ? Logger.log(`Обнаружены дубликаты - ${duplicates}`) : Logger.log(`Дупликатов нет`);
  return duplicates;
};