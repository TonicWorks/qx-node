module.exports = {
    "enums":  {
        "WorkType": {
            "RESIDENTIAL_PURCHASE":            1, "RESIDENTIAL_SALE": 2, "RESIDENTIAL_TRANSFER": 3, "RESIDENTIAL_REMORTGAGE": 4,
            "RESIDENTIAL_CASHBACK_REMORTGAGE": 5, "RESIDENTIAL_LEASE_EXTENSION": 6, "SCOTLAND_RESIDENTIAL_PURCHASE": 51, "SCOTLAND_RESIDENTIAL_SALE": 52,
            "COMMERCIAL_PURCHASE":             101, "COMMERCIAL_SALE": 102, "DIVORCE_UNCONTESTED_PETITIONER": 201, "DIVORCE_UNCONTESTED_RESPONDENT": 202,
            "PRENUPTIAL_AGREEMENT":            301, "POSTNUPTIAL_AGREEMENT": 302, "COHABITATION_AGREEMENT": 303, "SEPARATION_AGREEMENT": 304,
            "CHANGE_OF_NAME_DEED":             401, "STATUTORY_DECLARATION": 402

            "GRANT_OF_PROBATE":          501,
            "ADMINISTER_ESTATE":         502,
            "LASTING_POWER_OF_ATTORNEY": 503,
            "DRAFT_A_WILL":              504,

            "STOCK_RESERVATION": 1001,
            "NSW_PURCHASE":      2001,
            "NSW_SALE":          2002
        },
        "WorkTypeCategory": {
            "RESIDENTIAL_CONVEYANCING": 1, "COMMERCIAL_CONVEYANCING": 2, "FAMILY_LAW": 3, "SCOTLAND_RESIDENTIAL_CONVEYANCING": 25, "OTHER_LEGAL_SERVICES": 100,
            "WILLS_AND_PROBATE":        300, "POWER_OF_ATTORNEY": 400
        },
        "FeeCategory": {
            "LEGAL_FEES_ID": 1,
            "ADDITIONAL_COSTS_ID": 2,
            "DISBURSEMENTS_ID": 3,
            "ADDITIONAL_DISBURSEMENTS_ID": 4,
            "TAXES_ID": 50,
            "SERVICE_FEES_ID": 1000
        },
        "TenureType": { "TYPE_FREEHOLD": 1, "TYPE_LEASEHOLD": 2 },
        "MortgageType": { "NONE": 0, "REGULAR": 1, "ISLAMIC": 2 },
        "JobStatusType": {
            "QUOTE_STATUS_CREATED":              1, "QUOTE_STATUS_DECLINED": 2, "QUOTE_STATUS_INSTRUCTED": 3, "QUOTE_STATUS_REFERRAL_COMPLETE_UNUSED": 4,
            "QUOTE_STATUS_PARTIALLY_INSTRUCTED": 5, "QUOTE_STATUS_DUPLICATE_30_DAY": 6, "QUOTE_TEST": 20, "QUOTE_STATUS_PROVISIONAL": 30,
            "QUOTE_STATUS_DUPLICATE_24_HOUR":    40, "JOB_STATUS_ACTIVE": 100, "JOB_STATUS_ON_HOLD": 101, "JOB_STATUS_REFERRAL_COMPLETE": 102,
            "JOB_STATUS_CANCELLED":              110
        }
    },
    "choice": {
        "WorkType":         [[1, "Purchase"], [2, "Sale"], [3, "Transfer of Equity"], [4, "Remortgage"], [5, "Cashback Remortgage"], [6, "Lease Extension"], [51, "Purchase (Scotland)"], [52, "Sale (Scotland)"], [101, "Comm Purchase"], [102, "Comm Sale"], [201, "Uncontested Divorce (Petitioner)"], [202, "Uncontested Divorce (Respondent)"], [301, "Prenuptial Agreement"], [302, "Postnuptial Agreement"], [303, "Cohabitation Agreement"], [304, "Separation Agreement"], [401, "Change of Name Deed"], [402, "Statutory Declaration"]],
        "WorkTypeCategory": [[1, "Residential Conveyancing (England\/Wales)"], [2, "Commercial Conveyancing (England\/Wales)"], [3, "Family Law"], [25, "Residential Conveyancing (Scotland)"], [100, "Other Legal Services"], [300, 'Wills and Probate'], [400, 'Power of Attorney']],
        "FeeCategory":      [[1, "Legal Fees"], [2, "Additional Costs"], [3, "Disbursements"], [4, "Additional Disbursements"], [50, "Taxes"], [1000, "Service Fees"]],
        "TenureType":       [[1, "Freehold"], [2, "Leasehold"]], "MortgageType": [[0, "(no mortgage)"], [1, "Regular Mortgage"], [2, "Islamic Mortgage"]],
        "JobStatusType":    [[1, "Created"], [2, "Declined"], [3, "Instructed"], [4, "Referral Complete Unused"], [5, "Partially Instructed"], [6, "Duplicate (within 30 days)"], [20, "Test Quote"], [30, "Created Provisional"], [40, "Duplicate (within 24 hours)"], [100, "Active"], [101, "On-hold"], [102, "Referral Complete"], [110, "Cancelled"]]
    }
};
