const express = require('express');
const fileUpload = require('express-fileupload');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'uploads')));

app.post('/api/upload', (req, res) => {
    const groupFile = req.files.groupFile;
    const hostelFile = req.files.hostelFile;

    const groups = [];
    const hostels = [];

    groupFile.mv(path.join(__dirname, 'uploads', 'groupFile.csv'), (err) => {
        if (err) return res.status(500).send(err);

        fs.createReadStream(path.join(__dirname, 'uploads', 'groupFile.csv'))
            .pipe(csv())
            .on('data', (row) => {
                groups.push(row);
            })
            .on('end', () => {
                hostelFile.mv(path.join(__dirname, 'uploads', 'hostelFile.csv'), (err) => {
                    if (err) return res.status(500).send(err);

                    fs.createReadStream(path.join(__dirname, 'uploads', 'hostelFile.csv'))
                        .pipe(csv())
                        .on('data', (row) => {
                            hostels.push(row);
                        })
                        .on('end', () => {
                            const allocation = allocateRooms(groups, hostels);
                            res.json(allocation);
                        });
                });
            });
    });
});

const allocateRooms = (groups, hostels) => {
    // Room allocation algorithm implementation
    const allocationResult = [];

    // Sample allocation logic
    groups.forEach(group => {
        const availableHostel = hostels.find(hostel => hostel.Gender === group.Gender && hostel.Capacity >= group.Members);
        if (availableHostel) {
            allocationResult.push({
                groupId: group.GroupID,
                hostelName: availableHostel['Hostel Name'],
                roomNumber: availableHostel['Room Number'],
                membersAllocated: group.Members
            });
            availableHostel.Capacity -= group.Members;
        }
    });

    return allocationResult;
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
