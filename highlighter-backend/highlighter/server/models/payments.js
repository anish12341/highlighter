'use strict';
module.exports = (sequelize, DataTypes) => {
    const payments = sequelize.define('payments', {
        user_id: DataTypes.BIGINT,
        payment_type: DataTypes.STRING,
        amount: DataTypes.DECIMAL,
        payment_time: DataTypes.DATE
    }, {});
    payments.sync({alter: true}, ()=>{});
    return payments;
};
