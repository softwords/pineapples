(function () {

    var format = function (str, col) {
        col = typeof col === 'object' ? col : Array.prototype.slice.call(arguments, 1);

        return str.replace(/\{\{|\}\}|\{(\w+)\}/g, function (m, n) {
            if (m == "{{") { return "{"; }
            if (m == "}}") { return "}"; }
            return col[n];
        });
    };

    //------------------------------------
    // Pineapple API defined as service
    //------------------------------------
   
    function Pineapple(data) {
        var self = this;
        this.xml = $(data);
    };

        // this function contructs the pineapples prototype

        function makepp() {
            var pp = {};
            pp.domvalue = function (xpath, xattr) {
                if (xattr)
                    return this.xml.find(xpath).attr(xattr);
                else
                    return xml.find(xpath).text();
            };
            pp.domsum = function (xpath, xattr) {
                var tot = 0;
                this.xml.find(xpath).each(function (ix) {
                    if (xattr)
                        tot += parseFloat($(this).attr(xattr));
                    else
                        tot += parseFloat($(this).text());
                });
                return tot;
            };
            pp.schoolCount = function (year, schoolType) {
                if (year)
                    var xpath = format('schoolcounts > schoolcount[year="{0}"][schooltype="{1}"]', year, schoolType);
                else {
                    var xpath = format('schoolcounts > schoolcount[schooltype="{0}"]', schoolType);
                }
                return this.domsum(xpath, 'count');

            };

            pp.ERTable = function (surveyYear, edLevelCode, gender, dataPoint) {
                if (!gender)
                    gender = "";
                var xpath = 'ERs > ER[year="{0}"][edLevelCode="{1}"]'.format(surveyYear, edLevelCode, gender, dataPoint);

                xpath = format('ERs > ER[year="{0}"][edLevelCode="{1}"] > {3}{2}', surveyYear, edLevelCode, gender, dataPoint);

                switch (gender) {
                    case 'I':
                    case 'GPI':
                    case 'F/M':
                        var f = this.ERTable(surveyYear, edLevelCode, "F", dataPoint);
                        var m = this.ERTable(surveyYear, edLevelCode, "M", dataPoint);
                        return f / m;

                    case "M%":
                        var tot = this.ERTable(surveyYear, edLevelCode, "", dataPoint);
                        var m = this.ERTable(surveyYear, edLevelCode, "M", dataPoint);
                        return m / tot;

                    case "F%":
                        var tot = this.ERTable(surveyYear, edLevelCode, "", dataPoint);
                        var f = this.ERTable(surveyYear, edLevelCode, "F", dataPoint);
                        return f / tot;

                    case 'M':
                    case 'F':
                    case '':
                        return this.domsum(xpath);
                }
            }

            pp.edLevelHeader = function (surveyYear, edLevelCode, item) {
                var xpath = format('ERs > ER[year="{0}"][edLevelCode="{1}"]', surveyYear, edLevelCode);
                var xattr = item
                return this.domsum(xpath, xattr);
            }
            pp.edLevelEnrol = function (surveyYear, edLevelCode, gender) {
                return this.ERTable(surveyYear, edLevelCode, gender, "enrol");
            }
            pp.edLevelNetEnrol = function (surveyYear, edLevelCode, gender) {
                return this.ERTable(surveyYear, edLevelCode, gender, "nEnrol");
            }

            pp.edLevelPop = function (surveyYear, edLevelCode, gender) {
                return this.ERTable(surveyYear, edLevelCode, gender, "pop");
            }


            pp.edLevelGER = function (surveyYear, edLevelCode, gender) {
                return this.ERTable(surveyYear, edLevelCode, gender, "ger");
            }

            pp.edLevelNER = function (surveyYear, edLevelCode, gender) {
                return this.ERTable(surveyYear, edLevelCode, gender, "ner");
            }

            pp.edLevelGIR = function (surveyYear, edLevelCode, gender) {
                return this.ERTable(surveyYear, edLevelCode, gender, "gir");
            }

            pp.edLevelNIR = function (surveyYear, edLevelCode, gender) {
                return this.ERTable(surveyYear, edLevelCode, gender, "nir");
            }
            pp.edLevelGIRLast = function (surveyYear, edLevelCode, gender) {
                // find the last year of ed
                var yoeLast = this.edLevelLastYoE(surveyYear, edLevelCode)
                return this.yoeGIR(surveyYear, yoeLast, gender)

            }
            pp.edLevelNIRLast = function (surveyYear, edLevelCode, gender) {
                // find the last year of ed
                var yoeLast = this.edLevelLastYoE(surveyYear, edLevelCode)
                return this.yoeNIR(surveyYear, yoeLast, gender)

            }


            pp.edLevelIntake = function (surveyYear, edLevelCode, gender) {
                return this.ERTable(surveyYear, edLevelCode, gender, "intake");
            }

            pp.edLevelNetIntake = function (surveyYear, edLevelCode, gender) {
                return this.ERTable(surveyYear, edLevelCode, gender, "nIntake");
            }
            pp.edLevelRep = function (surveyYear, edLevelCode, gender) {
                return this.ERTable(surveyYear, edLevelCode, gender, "rep");
            }
            pp.edLevelRepRate = function (referenceYear, edLevelCode, gender) {
                switch (gender) {
                    case "I":
                    case "GPI":
                    case "F/M":
                        var m = this.edLevelRepRate(referenceYear, edLevelCode, "M");
                        var f = this.edLevelRepRate(referenceYear, edLevelCode, "F");
                        return f / m;
                    case "F":
                    case "M":
                    case "":
                        var r = this.ERTable(referenceYear + 1, edLevelCode, gender, 'rep');
                        var e = this.ERTable(referenceYear, edLevelCode, gender, 'enrol');
                        return r / e;
                }

            }

            //**********
            // Education Level parameters
            //**********
            pp.edLevelNumYears = function (surveyYear, edLevelCode) {
                return this.edLevelHeader(surveyYear, edLevelCode, "numYears");
            }

            pp.edLevelStartAge = function (surveyYear, edLevelCode) {
                return this.edLevelHeader(surveyYear, edLevelCode, "startAge");
            }
            pp.edLevelFirstYoE = function (surveyYear, edLevelCode) {
                return this.edLevelHeader(surveyYear, edLevelCode, "firstYear");
            }
            pp.edLevelLastYoE = function (surveyYear, edLevelCode) {
                return this.edLevelHeader(surveyYear, edLevelCode, "lastYear");
            }

            //**************
            // Class Level enrolment
            //
            pp.itemTableBase = function (xpathTable, surveyYear, itemCode, gender, dataPoint) {
                if (!gender)
                    gender = "";
                //var xpath = 'ERs > ER[year="{0}"][edLevelCode="{1}"]'.format(surveyYear, levelCode, gender, dataPoint);

                var xpath = format(xpathTable, surveyYear, itemCode, gender, dataPoint);

                switch (gender) {
                    case 'I':
                    case 'GPI':
                    case 'F/M':
                        var f = this.itemTableBase(xpathTable, surveyYear, itemCode, "F", dataPoint);
                        var m = this.itemTableBase(xpathTable, surveyYear, itemCode, "M", dataPoint);
                        return f / m;

                    case "M%":
                        var tot = this.itemTableBase(xpathTable, surveyYear, itemCode, "", dataPoint);
                        var m = this.itemTableBase(xpathTable, surveyYear, itemCode, "M", dataPoint);
                        return m / tot;

                    case "F%":
                        var tot = this.itemTableBase(xpathTable, surveyYear, itemCode, "", dataPoint);
                        var f = this.itemTableBase(xpathTable, surveyYear, itemCode, "F", dataPoint);
                        return f / tot;

                    case 'M':
                    case 'F':
                    case '':
                        return this.domsum(xpath);
                }

            };
            pp.classLevelTable = function (surveyYear, levelCode, gender, dataPoint) {
                var xpath = 'LevelERs > LevelER[year="{0}"][levelCode="{1}"] > {3}{2}';
                return this.itemTableBase(xpath, surveyYear, levelCode, gender, dataPoint);
            };

            pp.classLevelEnrol = function (surveyYear, levelCode, gender) {
                return this.classLevelTable(surveyYear, levelCode, gender, "enrol");
            };
            pp.classLevelNetEnrol = function (surveyYear, levelCode, gender) {
                return this.classLevelTable(surveyYear, levelCode, gender, "nEnrol");
            };
            pp.classLevelPop = function (surveyYear, levelCode, gender) {
                return this.classLevelTable(surveyYear, levelCode, gender, "pop");
            };
            pp.classLevelNER = function (surveyYear, levelCode, gender) {
                return this.classLevelTable(surveyYear, levelCode, gender, "ner");
            };
            pp.classLevelGER = function (surveyYear, levelCode, gender) {
                return this.classLevelTable(surveyYear, levelCode, gender, "ger");
            };
            // single year versions - by year of education
            pp.yoeTable = function (surveyYear, yoe, gender, dataPoint) {
                var xpath = 'LevelERs > LevelER[year="{0}"][yearOfEd="{1}"] > {3}{2}';
                return this.itemTableBase(xpath, surveyYear, yoe, gender, dataPoint);
            };
            pp.yoeEnrol = function (surveyYear, yoe, gender) {
                return this.yoeTable(surveyYear, yoe, gender, "enrol");
            };
            pp.yoeNetEnrol = function (surveyYear, yoe, gender) {
                return this.yoeTable(surveyYear, yoe, gender, "nEnrol");
            };
            pp.yoePop = function (surveyYear, yoe, gender) {
                return this.yoeTable(surveyYear, yoe, gender, "pop");
            };
            pp.yoeRep = function (surveyYear, yoe, gender) {
                return this.yoeTable(surveyYear, yoe, gender, "rep");
            };
            pp.yoeNER = function (surveyYear, yoe, gender) {
                return this.yoeTable(surveyYear, yoe, gender, "ner");
            };
            pp.yoeGER = function (surveyYear, yoe, gender) {
                return this.yoeTable(surveyYear, yoe, gender, "ger");
            };
            pp.yoeNIR = function (surveyYear, yoe, gender) {
                return this.yoeTable(surveyYear, yoe, gender, "nir");
            };
            pp.yoeGIR = function (surveyYear, yoe, gender) {
                return this.yoeTable(surveyYear, yoe, gender, "gir");
            };

            //
            // Sectors, including teacher numbers
            //
            pp.sectorTable = function (surveyYear, sectorCode, gender, dataPoint) {
                var xpath = 'TeacherQCs > TeacherQC[year="{0}"][sectorCode="{1}"] > {3}{2}';
                return this.itemTableBase(xpath, surveyYear, sectorCode, gender, dataPoint);
            };

            pp.sectorTeachers = function (surveyYear, sectorCode, gender) {
                return this.sectorTable(surveyYear, sectorCode, gender, "Teachers");
            };

            pp.sectorTeachersQual = function (surveyYear, sectorCode, gender) {
                return this.sectorTable(surveyYear, sectorCode, gender, "qual");
            };
            pp.sectorTeachersQualP = function (surveyYear, sectorCode, gender) {
                return this.sectorTable(surveyYear, sectorCode, gender, "qualPerc");
            };
            pp.sectorTeachersCert = function (surveyYear, sectorCode, gender) {
                return this.sectorTable(surveyYear, sectorCode, gender, "cert");
            };
            pp.sectorTeachersCertP = function (surveyYear, sectorCode, gender) {
                return this.sectorTable(surveyYear, sectorCode, gender, "certPerc");
            };

            pp.sectorPTR = function (surveyYear, sectorCode) {
                return this.sectorTable(surveyYear, sectorCode, "", "PTR");
            };
            pp.sectorEnrol = function (surveyYear, sectorCode) {
                return this.sectorTable(surveyYear, sectorCode, "", "Enrol");
            };
            //
            // Survival Rates
            //
            pp.yoeSurvivalTable = function (year, yearOfEd, gender, dataPoint) {
                var xpath = 'Survivals > Survival[year="{0}"][yearOfEd="{1}"] > {3}{2}';

                return this.itemTableBase(xpath, year, yearOfEd, gender, dataPoint);
            }
            pp.yoePromotionFrom = function (referenceYear, yearOfEd, gender) {
                return this.yoeSurvivalTable(referenceYear, yearOfEd, gender, "PR")
            };
            pp.yoeRepetitionRate = function (referenceYear, yearOfEd, gender) {
                return this.yoeSurvivalTable(referenceYear, yearOfEd, gender, "RR")
            };
            pp.yoeTransitionFrom = function (referenceYear, yearOfEd, gender) {
                return this.yoeSurvivalTable(referenceYear, yearOfEd, gender, "TR")
            };
            pp.yoeSurvivalTo = function (referenceYear, toYearOfEd, gender, fromYearOfEd) {
                if (!fromYearOfEd)
                    fromYearOfEd = 1;

                switch (gender) {
                    case 'I':
                    case 'GPI':
                    case 'F/M':
                        var f = this.yoeSurvivalTo(referenceYear, toYearOfEd, 'F', fromYearOfEd);
                        var m = this.yoeSurvivalTo(referenceYear, toYearOfEd, 'M', fromYearOfEd);
                        return f / m;


                    case 'M':
                    case 'F':
                    case '':
                        if (fromYearOfEd == 1)
                            return this.yoeSurvivalTable(referenceYear, toYearOfEd, gender, "SR");
                        else
                            return this.yoeSurvivalTable(referenceYear, toYearOfEd, gender, "SR") /
                                        this.yoeSurvivalTable(referenceYear, fromYearOfEd, gender, "SR");
                }
            }

            // construction details
            pp.vermTable = function (item) {
                return this.xml.attr(item);
            }
            pp.getSourceServer = function () {
                return this.vermTable("server");
            }
            pp.getSourceDB = function () {
                return this.vermTable("database");
            }

            pp.getCreateDate = function () {
                return this.vermTable("createdate");
            }

            // system details
            pp.paramTable = function (item) {
                return this.xml.find("Params").attr(item);
            }
            pp.getNation = function () {
                return this.paramTable("nation");
            }
            pp.getAppName = function () {
                return this.paramTable("appname");
            }
            pp.getAppNameFull = function () {
                return this.paramTable("appnamefull");
            }

            pp.getNode = function (xpath) {
                return this.xml.find(xpath);
            };
            pp.getEdLevelNode = function (surveyYear, edLevelCode) {
                var xpath = format('ERs > ER[year="{0}"][edLevelCode="{1}"]', surveyYear, edLevelCode);
                return this.getNode(xpath);
            };
            pp.getSectorTeacherNode = function (surveyYear, sectorCode) {
                var xpath = format('TeacherQCs > TeacherQC[year="{0}"][sectorCode="{1}"]', surveyYear, sectorCode);
                return this.getNode(xpath);
            };

            pp.getYoENode = function (surveyYear, yoe) {
                var xpath = format('LevelERs > LevelER[year="{0}"][yearOfEd="{1}"]', surveyYear, yoe);
                return this.getNode(xpath);
            };

            pp.getMFT = function (node, dataPoint) {
                var t = parseFloat(node.find(dataPoint).text());
                var m = parseFloat(node.find(dataPoint + 'M').text());
                var f = parseFloat(node.find(dataPoint + 'F').text());

                return { T: t, M: m, F: f, P: f / t, I: f / m };
            }

            pp.getEdLevelYearSeries = function (startYear, endYear, edLevelCode, dataPoint) {
                var ret = {};
                var data = {};

                var self = this;
                dataPoint.forEach(function (dp) {
                    data[dp] = { M: [], F: [], T: [] };
                });
                for (var i = startYear; i <= endYear; i++) {

                    var edLevelNode = this.getEdLevelNode(i, edLevelCode);
                    if (edLevelNode) {
                        dataPoint.forEach(function (dp) {
                            var MFT = self.getMFT(edLevelNode, dp);

                            data[dp].M.push({ yr: i, v: MFT.M });
                            data[dp].F.push({ yr: i, v: MFT.F });
                            data[dp].T.push({ yr: i, v: MFT.T });
                        });
                    }
                }
                var ret = {};
                dataPoint.forEach(function (dp) {
                    var d = [{ key: 'M', values: data[dp].M },
                              { key: 'F', values: data[dp].F },
                              { key: 'all', values: data[dp].T }
                    ];
                    ret[dp] = d;
                });
                return ret;
            }
            return pp;
        };
        Pineapple.prototype = makepp();

        // factry to return the promise of a  Pineapple
        function PineappleFactory($q,api) {
            
            var d = $q.defer();
            api.vermdata().then(function (pdata) {
                d.resolve(new Pineapple(pdata));
            },
            function () {
                d.reject();
            })
            return d.promise;
            
        };
        angular
            .module('pineapples')
            // vermData will be supplied by the state resolve: from mAndEAPI
            .factory('Pineapple', ['$q','mandeAPI', PineappleFactory]);

 

})();