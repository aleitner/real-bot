const ADD_COLUMN_FOR_RECORD_COSTS = `
    ALTER TABLE chatgptbot_config ADD COLUMN serverCost REAL NOT NULL DEFAULT 0;
`;

module.exports = {
    up: ADD_COLUMN_FOR_RECORD_COSTS
};