GroupMe+ is the product of roughly 24 hours of work at PennApps Fall 2014, a hackathon at the University of Pennsylvania. The team was composed of three UPenn students: Alex Harelick (junior, studying NETS), Anjali Khetan (junior, studying CIS), and Corey Loman (junior, studying NETS).

A large numer of college students, especially at Penn, use the popular messaging app GroupMe. They often have many conversations with anywhere from three people to thirty people in a group. For example, among the members on our team, we each had at least five active conversations with a particular conversation totaling anywhere from 20 messages (in a small group of 3 people) to over 20,000 messages (in a larger group of 20+ people).

Finding old messages under the current web app structure is extremely cumbersome, so we developed GroupMe+, which adds message search to GroupMe. We developed a web app, built in JavaScript/HTML/CSS, running a Node.js backend that connects to MongoDB.

There is essentially one main user screen after login, and it allows the user to seamlessly switch between conversations/groups, send and read messages in a particular group, as well as search messages within the current group he or she is viewing.

The vast majority of the JavaScript code exists in two files: /views/main.hjs (written mostly by Corey) and /groupme.js (written mostly by Alex). All stylesheet work was done by Anjali and can be viewed in /public/stylesheets/style.css.

Some known issues with the code include some inefficiency with storing and querying messages in very large groups. For example, in the group with greater than 25,000 messages, our app performs somewhat slowly. However, with groups containing less than 15,000 messages, it performs quite well.

In the future, we'd like to rework how we go about storing and querying. We simply ran out of time at PennApps to do so. We'd also like to add support for favoriting messages within the app. Currently, we show the number of favorites associated with a particular message, but we do not allow a user to favorite and unfavorite messages within GroupMe+. Lastly, we'd love to add the search feature of retrieving all messages between two particular dates within a conversation. It would require some tweaks to how we're storing to the database and how we're handling the retrieved data from MongoDB, but we think it would be very helpful functionality to have.

Thanks for checking out our app! If you have any more questions, feel free to email us.