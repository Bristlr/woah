var mongojs = require('mongojs');
var l = new require("bristlr-logger")();
var db = mongojs.connect(process.env.MONGO_MULTI_CONNECTION_STRING, ['users']);

module.exports = function(repoName) {

	function find(query, callback) {
		var startTime = new Date().getTime();
		db[repoName].find(query).toArray(function(err, results) {
			if (err) console.log("find Error: ", err);
			logMeasurement("find", startTime);
			callback(results);
		});
	}

	function findWithProjection(query, projection, callback) {
		var startTime = new Date().getTime();
		db[repoName].find(query, projection).toArray(function(err, results) {
			if (err) console.log("findWithProjection Error: ", err);
			logMeasurement("findWithProjection", startTime);
			callback(results);
		});
	}

	function findWithProjectionAndLimit(query, projection, limit, callback) {
		var startTime = new Date().getTime();
		db[repoName].find(query, projection).limit(limit).toArray(function(err, results) {
			if (err) console.log("findWithProjectionAndLimit Error: ", err);
			logMeasurement("findWithProjectionAndLimit", startTime);
			callback(results);
		});
	}

	function findWithProjectionAndLimitAndSort(query, projection, sort, limit, callback) {
		var startTime = new Date().getTime();
		db[repoName].find(query, projection).sort(sort).limit(limit).toArray(function(err, results) {
			if (err) console.log("findWithProjectionAndLimitAndSort Error: ", err);
			logMeasurement("findWithProjectionAndLimitAndSort", startTime);
			callback(results);
		});
	}

	function findOne(query, callback) {
		find(query, function(results) {
			callback(results[0]);
		});
	}

	function findById(id, callback) {
		var idObject = buildId(id);

		findOne({
			_id: idObject
		}, callback);
	}

	function findByIds(idArray, callback) {

		for (var i = 0; i < idArray.length; i++) {
			idArray[i] = buildId(idArray[i]);
		}

		find({
			_id: {
				$in: idArray
			}
		}, callback);
	}

	function save(data, callback) {

		var startTime = new Date().getTime();
		db[repoName].save(data, function(err, saved) {
			if (err) console.log("Save Error: ", err);
			logMeasurement("save", startTime);
			callback(saved);
		});
	}

	function insert(data, callback) {

		var startTime = new Date().getTime();
		db[repoName].insert(data, function(err, inserted) {
			if (err) console.log("Insert Error: ", err);
			logMeasurement("insert", startTime);
			callback();
		});
	}

	function updateById(id, updateRequest, callback) {
		var startTime = new Date().getTime();

		var query = buildQuery(id);

		var updateQuery = {
			$set: updateRequest
		};

		var multi = {
			multi: false
		};

		db[repoName].update(query, updateQuery, multi, function() {

			logMeasurement("updateById", startTime);
			callback();
		});
	}

	function update(query, updateRequest, callback) {

		var updateQuery = {
			$set: updateRequest
		};

		var multi = {
			multi: true
		};

		updateWithOptions(query, updateQuery, multi, callback);
	}

	function updateWithOptions(query, updateRequest, options, callback) {
		var startTime = new Date().getTime();

		db[repoName].update(query, updateRequest, options, function() {

			logMeasurement("updateWithOptions", startTime);
			callback();
		});
	}

	function buildId(id) {
		var ObjectId = mongojs.ObjectId;
		try {
			return ObjectId(String(id));
		} catch (e) {
			return undefined;
		}
	}

	function buildQuery(id) {
		return {
			_id: buildId(id)
		};
	}

	function removeById(id, callback) {
		var query = buildQuery(id);
		removeOneUsingQuery(query, callback);
	}

	function removeOneUsingQuery(query, callback) {
		var startTime = new Date().getTime();
		db[repoName].remove(query, true, function() {

			logMeasurement("removeOneUsingQuery", startTime);
			callback(true);
		});
	}

	function removeAllUsingQuery(query, callback) {
		var startTime = new Date().getTime();
		db[repoName].remove(query, false, function() {
			logMeasurement("removeAllUsingQuery", startTime);
			callback(true);
		});
	}

	function logMeasurement(name, startTime) {
		if (process.env.ENVIRONMENT != "development") {
			l.count("databasec." + name);
			l.time("database." + name, (new Date().getTime() - startTime));
		}
	}

	function stats(callback) {
		db[repoName].stats(function(err, stats){
			callback(stats);
		});
	}

	return {
		find: find,
		findOne: findOne,
		findById: findById,
		findByIds: findByIds,
		save: save,
		insert: insert,
		updateById: updateById,
		updateWithOptions: updateWithOptions,
		update: update,
		removeOneUsingQuery: removeOneUsingQuery,
		removeAllUsingQuery: removeAllUsingQuery,
		removeById: removeById,
		findWithProjection: findWithProjection,
		findWithProjectionAndLimit: findWithProjectionAndLimit,
		findWithProjectionAndLimitAndSort: findWithProjectionAndLimitAndSort,
		stats: stats
	};
};