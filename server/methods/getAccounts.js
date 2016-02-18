if (Meteor.isServer) {

    Meteor.methods({
        'refreshAccountList': function () {
            // delete all accounts and then refresh them
            FacebookAccountList.remove( {} )
            let accountsDataArray = [];
            let accountsData;
            try {
                let result = HTTP.call('GET', 'https://graph.facebook.com/v2.5/678433138873450/adaccounts?fields=name,amount_spent&limit=50&access_token='+token+'', {});
                accountsData = result;
                accountsDataArray.push(accountsData.data.data);

                while (true) {
                    try {
                        accountsData = HTTP.call('GET', accountsData.data.paging['next'], {});
                        accountsDataArray.push(accountsData.data.data);
                    } catch(e) {
                        console.log('no more pages and error:', e);
                        break;
                    }
                }
            } catch(e) {
                console.log('there has been an error in the top level try catch')
                console.log(e);
            }

            try {
                for (let i = 0; i < accountsDataArray.length; i++) {
                    for (let j = 0; j < accountsDataArray[i].length; j++) {
                        FacebookAccountList.insert({
                            name: accountsDataArray[i][j].name,
                            account_id: accountsDataArray[i][j].account_id,
                            amount_spent: accountsDataArray[i][j].amount_spent,
                            inserted: moment().format("MM-DD-YYYY")
                        });
                    }
                }
            } catch(e) {
                console.log(e);
            } finally {
                return accountsDataArray;
            }
        }
    });

    Meteor.publish('fbAccountList', function () {
        return FacebookAccountList.find({}); //publish all accounts
    })

};
