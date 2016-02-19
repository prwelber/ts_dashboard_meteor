Initiatives = new Mongo.Collection('newInitiativeList')

let Schemas = {};

Schemas.Initiative = new SimpleSchema({
    name: {
        type: String,
        label: "Name",
        max: 200
    },
    brand: {
        type: String,
        label: "Brand"
    },
    agency: {
        type: String,
        label: "Agency"
    },
    dealType: {
        type: String,
        label: "Deal Type"
    },
    budget: {
        type: Number,
        label: "Budget (do not use commas)",
        min: 1
    },
    startDate: {
        type: Date,
        label: "Start Date"
    },
    endDate: {
        type: Date,
        label: "End Date"
    },
    notes: {
        type: String,
        label: "Notes"
    }
})

Initiatives.attachSchema(Schemas.Initiative);

