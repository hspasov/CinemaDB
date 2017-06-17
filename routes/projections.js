var express = require('express');
var router = express.Router();
var securityCheck = require('./../modules/securityCheck.js');

router.get('/:projectionId/buyTicket', securityCheck.isLoggedIn, (req, res) => {
	var db = req.db;
	db.query("SELECT * FROM ProjectionViewers WHERE ProjectionId = ? AND Username = ?", 
		[req.params.projectionId, req.user.Username], 
		(err, rows) => {
			if (err) {
				console.log(err);
				res.status(500).send('Internal Server Error');
			} else if (rows.length) {
				res.send("You've already bought ticket for this projection!");
			} else {
				var insertProjectionViewer = `INSERT INTO ProjectionViewers
					(ProjectionId, Username)
				VALUES
					(?, ?)`;
				db.query(
					insertProjectionViewer,
					[req.params.projectionId, req.user.Username],
					err => {
						if (err) {
							console.log(err);
							res.status(500).send('Internal Server Error');
						}
						console.log("Inserted Projection Viewer");
						res.status(201).send('Successfully bought a ticket');
					}
				);
			}
	});
});

router.get('/:projectionId/returnTicket', securityCheck.isLoggedIn, (req, res) => {
	var db = req.db;
	db.query("SELECT * FROM ProjectionViewers WHERE ProjectionId = ? AND Username = ?", 
		[req.params.projectionId, req.user.Username], 
		(err, rows) => {
			if (err) {
				console.log(err);
				res.status(500).send('Internal Server Error');
			} else if (rows.length == 0) {
				res.send("You are not registered for this projection!");
			} else {
				var removeProjectionViewer = `DELETE FROM ProjectionViewers
					WHERE ProjectionId = ? AND Username = ?`;
				db.query(
					removeProjectionViewer,
					[req.params.projectionId, req.user.Username],
					err => {
						if (err) {
							console.log(err);
							res.status(500).send('Internal Server Error');
						}
						res.status(200).send('Successfully returned a ticket');
					}
				);
			}
		}
	);
});

router.get('/:projectionId/edit', securityCheck.isAdmin, (req, res) => {
	res.render('editProjection', { projectionId: req.params.projectionId, user:req.user});
});

router.post('/:projectionId/edit', securityCheck.isAdmin, (req, res) => {
	var db = req.db;
	db.query("SELECT * FROM Projections WHERE Id = ?;",
		[req.params.projectionId],
		(err, result) => {
			if (err) {
				console.log(err);
				res.status(500).send('Internal Server Error');
			} else if (result.length == 0) {
				res.status(204).send('No Projection Found');
			} else {
				var movieId = (req.body.movieId) ?
					req.body.movieId : result[0].MovieId;
				var hallId = (req.body.hallId) ?
					req.body.hallId : result[0].HallId;
				var startTime = (req.body.startTime.length) ?
					req.body.startTime : result[0].StartTime;

				var updateProjections = `UPDATE Projections SET
					MovieId = ?, HallId = ?, StartTime = ?
					WHERE Id = ?;`;
				db.query(
					updateProjections,
					[
						movieId,
						hallId,
						startTime,
						req.params.projectionId
					],
					err => {
						if (err) {
							console.log(err);
							res.status(500).send('Internal Server Error');
						} else {
							res.status(201).send('Successfully updated projection');
						}
					}
				);
			}
		}
	);
});

router.get('/:projectionId/remove', securityCheck.isAdmin, (req, res) => {
	var db = req.db;
	var getProjection = "SELECT * FROM Projections WHERE Id = ?;"; 
	db.query(
		getProjection, 
		[req.params.projectionId], 
		(err, rows) => {
			if (err) {
				console.log(err);
				res.status(500).send('Internal Server Error');
			} else if (rows.length == 0) {
				res.status(204).send('No projection found');
			} else {
				var removeProjection = `DELETE FROM Projections
					WHERE Id = ?;`;
				db.query(
					removeProjection,
					[req.params.projectionId],
					err => {
						if (err) {
							console.log(err);
							res.status(500).send('Internal Server Error');
						}
						res.status(200).send('Successfully removed a projection');
					}
				);
			}
		}
	);
});

module.exports = router;