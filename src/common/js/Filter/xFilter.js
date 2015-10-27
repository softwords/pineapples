/* support service for CrossFilter

provides some standard methods for creating reductions, etc
*/
(function () {
    // token to use instead of null in dimensions 
    var nullToken = '<>';

    var fac = function () {
        var fltr = {
            // functions for creating a greoup - ie reducations
            // these perate on the raw data - a collection
            xReduce: xReduce,
            getPropAccessor: getPropAccessor,
            getPropYNAccessor: getPropYNAccessor,
            getConstAccessor: getConstAccessor,
            // these are used for retrieving values from the constructed group
            // these operate on an array of key / value pairs
            // and are used in presentations - ie for charts or in tables ( ng-repeat="g in grp.all()" )
            getGrpValueAccessor: getGrpValueAccessor,
            // totAccessor is a special case of above
            TotAccessor: getGrpValueAccessor('Tot'),
            getGrpRatioAccessor: getGrpRatioAccessor,
            // these are for type safety in the dimension, which doesn't like nulls
            getDimAccessor: getDimAccessor,
            nullToken: nullToken

        }
        return fltr;
    };
   


    // return a function that returns a constant ( usually 1)
    // can be used to supply the value when generating a reduction; ie when const is 1, this is a count of records.

    function getConstAccessor(c) {
        return function (d) {
            return c;
        }
    };

    //
    // builds a reduction based on a property that has 1, 0 representing Yes or No
    // will create the property Y or N in the reduction
    //(the value assigned to this property 
    function getPropYNAccessor(propname) {
        return function (d) {
            switch (d[propname]) {
                case 1:
                    return 'Y';
                case 0:
                    return 'N';
                default:
                    return '?';
            }
        }
    };

    // return a function that returns the value of a property
    // this value becomes a property in the reduction, this 'denormalises' or 'crosstabs' the field value
    // useful for tabulations

    function getPropAccessor(propname) {
        return function (d) {
            return d[propname];
        }
    };
    // Dimesnsion type safety
    // crossfilter is unhappy with nulls in dimensions,
    // but doesn;t do any checking for perfomance reasons.

    function getDimAccessor(propname) {
        return function (d) {
            return d[propname] || nullToken;
        }
    }

    //maybe useful for year???
    function getDimAccessorN(propname) {
        return function (d) {
            return d[propname] || 0;
        }
    }

    // Reporting functions
    //--------------------

    // in the group reduction, return the value of a property in the group value object
    // this is for reporting from the group
    function getGrpValueAccessor(propname) {
        return function (g) {
            
            return g.value[propname] || null;
        }
    };

    // return the ratio of two values in the group value.
    // useful for returning a percentage
    function getGrpRatioAccessor(numerator, divisor) {
        return function (g) {
            var d = g.value[divisor];
            var n = g.value[numerator];
            if (d)
                return n / d;
            return null;
        }
    };

    // keyAccessor - function to determine the property name in the 
    // valueAccessor
    function xReduce(dimension, keyAccessor, valueAccessor) {

        // based  on the keyAccessor and valueAccess generate the Initial Add and Remove functions

        function xgetInitial(keyAccessor, valueAccessor) {

            var i = function () {
                var pc = {};
                // add the accessors as properties
                pc.keyAccessor = keyAccessor;
                pc.valueAccessor = valueAccessor;
                pc.Tot = 0;
                return pc;

            }

            return i;

        }

        // construct the reduce initial
        var xreduceInitial = xgetInitial(keyAccessor, valueAccessor);

        // custom reduction based on Endorsement
        // reduceAdd
        function xreduceAdd(p, d) {
            var pc = _.clone(p);

            // get the key for the current item
            var k = (pc.keyAccessor(d) || 'na');
            var v = pc.valueAccessor(d);
            pc.Tot += v;
            if (!pc[k]) {
                pc[k] = v;
            }
            else {
                pc[k] += v;
            }
            return pc;

        };
        // reduceRemove
        function xreduceRemove(p, d) {
            var pc = _.clone(p);

            // get the key for the current item
            var k = (pc.keyAccessor(d) || 'na');
            var v = pc.valueAccessor(d);
            pc.Tot -= v;
            if (!pc[k]) {
                pc[k] = v * -1;             // weird?
            }
            else {
                pc[k] -= v;
            }
            return pc;


        };

        return dimension.group().reduce(xreduceAdd, xreduceRemove, xreduceInitial);
    };


    angular
        .module("sw.common")
        .factory("xFilter", [fac]);

})();
