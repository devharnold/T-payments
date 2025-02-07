// transaction charges file to determine the amount of cash a user will be charged for every transaction
import paymentsService from "./initiatePayments.js";
import { Pool } from 'pg';
import Accounts from "../account.js";
import BusinessAccounts from "../bussAccount.js";

export default class TransactionFee {
    constructor(amount, from_currency, to_currency, feePercentage) {
        this.amount = amount;
        this.from_currency = from_currency;
        this.to_currency = to_currency;
        this.feePercentage = feePercentage;
    }

    static async usdToGbpTransactionFee(from_currency, to_currency, amount) {
        // function to calculate the transaction fees when transferring usd to gbp
        paymentsService.getExchangeRate();
        
    }
}