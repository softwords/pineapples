//
// facade for at-a-glance
//
(function() {
    function AtAGlance(year, edLevel, edSector, p) {
        var edLevelNode = p.getEdLevelNode(year, edLevel);

        this.Population = p.getMFT(edLevelNode, 'pop');
        this.Enrolment = p.getMFT(edLevelNode, 'enrol');
        this.NetEnrolment = p.getMFT(edLevelNode, 'nenrol');
        this.Repeaters = p.getMFT(edLevelNode, 'rep');

        this.GER = p.getMFT(edLevelNode, 'ger');
        this.NER = p.getMFT(edLevelNode, 'ner');

        this.YearsOfSchooling = p.edLevelNumYears(year, edLevel);
        this.OfficialStartAge = p.edLevelStartAge(year, edLevel);

        var teacherNode = p.getSectorTeacherNode(year, 'PRI');// change 'PRI back to edSector
        this.Teachers = p.getMFT(teacherNode, "teachers");
        this.TeachersCert = p.getMFT(teacherNode, "cert");
        this.TeachersCertP = p.getMFT(teacherNode, "certperc");

        this.PTR = p.sectorPTR(year, 'PRI');

        // get last year's ed lvel node
        edLevelNode = p.getEdLevelNode(year - 1, edLevel);
        var LYE = p.getMFT(edLevelNode, 'enrol')       // last year's enrol
        this.RepRate = {
            T: this.Repeaters.T / LYE.T,
            M: this.Repeaters.M / LYE.M,
            F: this.Repeaters.F / LYE.F,
            I: (this.Repeaters.F / LYE.F) / (this.Repeaters.M / LYE.M),
            P: (this.Repeaters.F / LYE.F) / (this.Repeaters.T / LYE.T)
        };

        this.Survival4 = {
            T: p.yoeSurvivalTo(year - 1, 4, ''),
            M: p.yoeSurvivalTo(year - 1, 4, 'M'),
            F: p.yoeSurvivalTo(year - 1, 4, 'F'),

        };
        this.Survival4.I = this.Survival4.F / this.Survival4.M;
        this.Survival4.P = this.Survival4.F / this.Survival4.T;

        this.Survival6 = {
            T: p.yoeSurvivalTo(year - 1, 6, ''),
            M: p.yoeSurvivalTo(year - 1, 6, 'M'),
            F: p.yoeSurvivalTo(year - 1, 6, 'F'),

        };
        this.Survival6.I = this.Survival6.F / this.Survival6.M;
        this.Survival6.P = this.Survival6.F / this.Survival6.T;

        // gir into last year
        var lyoe = p.edLevelLastYoE(year, edLevel);
        var yoeNode = p.getYoENode(year, lyoe)

        this.GIRLast = p.getMFT(yoeNode, 'gir');


    };


    function AtAGlanceMgr(pfactory) {
        return pfactory.then(function(pineapple) {
            var mgr = {
                cache: {},
                p: pineapple,
                get: function (surveyYear, edLevelCode, edSector) {
                    var cache = this.cache;
                    if (!cache[surveyYear])
                        cache[surveyYear] = {};
                    var y = cache[surveyYear];
                    if (!y[edLevelCode])
                        y[edLevelCode] = new AtAGlance(surveyYear, edLevelCode, edSector, this.p);
                    return y[edLevelCode];
                },
                title: function () { return this.p.getAppNameFull() },
                source: function () { return this.p.getSourceServer() + ':' + this.p.getSourceDB() + ' snapshot created ' + this.p.getCreateDate() }
            }
            return mgr;
        });
    };

    angular
        .module('pineapples')
        .factory('AtAGlanceMgr', ['Pineapple', AtAGlanceMgr]);
})();

(function () {

    var ctrlr = function($scope, AtAGlanceMgr, $state) {

        var self = this;
        var statedata = $state.current.data;

        this.selectedEdLevel = statedata.selectedEdLevel; //'PRI';
        this.selectedSchoolType = statedata.selectedSchoolType;
        this.selectedSector = statedata.selectedSector;

        this.ataGlanceMgr = {};
        this.title = '';
        this.source = '';

        this.selectedYearData = {};
        this.baseYearData = {};

        // use defineProperty in order to implement setters and getter
        // on changing the year, we need to refresh the data
        // alternative is a $scope.$watch
        // this approach is more like 'WPF' data binding
        var selYear;
        var bYear;
        Object.defineProperty(this, 'selectedYear', {
            get: function () { return selYear; },
            set: function (newValue) {
                selYear = newValue;
                this.selectedYearData = this.ataGlanceMgr.get(this.selectedYear, this.selectedEdLevel);
                if (this.selectedYear <= this.baseYear)
                    this.baseYear = this.selectedYear - 1;
            }
        });
        Object.defineProperty(this, 'baseYear', {
            get: function () { return bYear; },
            set: function (newValue) {
                bYear = newValue;
                this.baseYearData = this.ataGlanceMgr.get(this.baseYear, this.selectedEdLevel);
                if (this.selectedYear <= this.baseYear)
                    this.selectedYear = parseInt(this.baseYear) + 1;
            }
        });

        // AtAGlanceMgr service returns a promise, pending the load of the xml data
        // the deliverable of this promise is a manager object
        // on delivery, we can calculate everything
        AtAGlanceMgr.then(function (mgr) {
           
            self.ataGlanceMgr = mgr;
            self.p = mgr.p;

            self.title = mgr.title();
            self.source = mgr.source();

            self.selectedYear = 2013;
            self.baseYear = 2012;
        });
        
    };
    angular
        .module('pineapples')
        .controller('AtAGlance', ['$scope', 'AtAGlanceMgr','$state', ctrlr]);

})();

(function () {

    var link = function (scope, element, attrs) {

        var cssclass = attrs.clickable;

        element.find('td').click(function () {
            $(this).toggleClass(cssclass);
        });
    }

    var directive = {
        scope: {
            cssclass: '@clickable'
        },
        link: link,
        restrict: 'A'
    }

    angular
        .module('pineapples')
        .directive('clickable', function () { return directive; });

})();