const User = require('../models/user');
const Post = require('../models/post');

const mongoose = require('mongoose');


module.exports.profile_get = (req, res) => {

    const id = req.params.id;
    const refreshToken = req.cookies['refresh-token']; // Accessing 'refresh-token' from cookies

    // Find the user by ID
    User.findById(id)
        .then((user) => {
            // Fetch the user's posts
            Post.find({ author: id })  // Assuming `userId` is the field linking posts to users
                .then(async (posts) => {

                    // Check if the refresh token stored in the DB matches the one in the cookies
                    if (user.refreshToken !== refreshToken) {

                        //show sensative information if you are the current user
                        res.status(200).render('UserProfile', {
                            posts: posts,
                            title: 'Profile ' + user.nickname,
                            nickname: user.nickname,
                        });



                    } else {
                        //show sensative information if you are the current user
                        res.status(200).render('MyProfile', {
                            user: user,
                            title: 'Profile ' + user.nickname,
                            posts: posts
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).send('Error fetching posts');
                });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error fetching user');
        });
}


module.exports.profile_getStatistics = (req, res) => {

    const userId = req.params.id;

    const authorId = new mongoose.Types.ObjectId(userId);

    Post.aggregate([
        {
            $match: { author: authorId } // Filter posts by the current user's ID
        },
        {
            $project: {
                likes: 1, // Include the likes field
                commentsCount: { $size: "$comments" }, // Calculate the number of comments per post
                date: 1, // Include the date field
                title: 1, // Include the title field (or any other fields you want)
                content: 1, // Include the content field (or any other fields you want)
                author: 1, // Include the author field
                body: 1 // Include the body field
            }
        },
        {
            $sort: { date: 1 } // Sort by date in ascending order (oldest first)
        },
        {
            $group: {
                _id: null, // Group everything together (single group)
                totalLikes: { $sum: "$likes" }, // Summing up all the "likes"
                totalPosts: { $sum: 1 }, // Counting the number of posts
                totalComments: { $sum: "$commentsCount" }, // Summing up all the comments
                oldestPost: { $first: "$$ROOT" }, // Get the entire oldest post object
                mostRecentPost: { $last: "$$ROOT" }, // Get the entire most recent post object
                mostLikedPost: { $max: "$likes" }, // Get the maximum number of likes
                leastLikedPost: { $min: "$likes" } // Get the minimum number of likes
            }
        },
        {
            $lookup: {
                from: "posts", // Lookup the most liked post in the posts collection
                let: { mostLikedPostLikes: "$mostLikedPost" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$likes", "$$mostLikedPostLikes"] }, // Match the post with the most likes
                            author: authorId // Ensure it belongs to the user
                        }
                    },
                    { $limit: 1 } // Limit to 1 post (in case of ties)
                ],
                as: "mostLikedPostDetails"
            }
        },
        {
            $lookup: {
                from: "posts", // Lookup the least liked post in the posts collection
                let: { leastLikedPostLikes: "$leastLikedPost" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$likes", "$$leastLikedPostLikes"] }, // Match the post with the least likes
                            author: authorId // Ensure it belongs to the user
                        }
                    },
                    { $limit: 1 } // Limit to 1 post (in case of ties)
                ],
                as: "leastLikedPostDetails"
            }
        },
        {
            $addFields: {
                mostLikedPost: { $arrayElemAt: ["$mostLikedPostDetails", 0] }, // Extract the most liked post object
                leastLikedPost: { $arrayElemAt: ["$leastLikedPostDetails", 0] }, // Extract the least liked post object
                mostRecentPost: {
                    $cond: {
                        if: { $eq: ["$mostLikedPostDetails.date", "$mostRecentPost.date"] }, // Check if most liked is also most recent
                        then: "$mostLikedPostDetails", // Use most liked as most recent
                        else: "$mostRecentPost" // Otherwise, keep the original most recent
                    }
                },
                oldestPost: {
                    $cond: {
                        if: { $eq: ["$mostLikedPostDetails.date", "$oldestPost.date"] }, // Check if most liked is also oldest
                        then: "$mostLikedPostDetails", // Use most liked as oldest
                        else: "$oldestPost" // Otherwise, keep the original oldest
                    }
                }
            }
        },
        {
            $project: {
                mostLikedPostDetails: 0, // Remove the temporary field
                leastLikedPostDetails: 0 // Remove the temporary field
            }
        }
    ])
        .then(result => {

            //console.log(result)
            // Check if result is not empty
            if (result.length > 0) {
                const totalLikes = result[0].totalLikes;
                const totalPosts = result[0].totalPosts;
                const totalComments = result[0].totalComments;
                const mostRecentPost = result[0].mostRecentPost;
                const oldestPost = result[0].oldestPost;
                const mostLikedPost = result[0].mostLikedPost;
                const leastLikedPost = result[0].leastLikedPost;

                // Render the statistics page and pass the data to the view
                res.status(200).render('statistics', {
                    title: 'Statistics',
                    totalLikes: totalLikes,
                    totalPosts: totalPosts,
                    totalComments: totalComments,
                    mostRecentPost: mostRecentPost,
                    oldestPost: oldestPost,
                    mostLikedPost: mostLikedPost,
                    leastLikedPost: leastLikedPost
                });
            } else {
                // Handle the case where no posts exist
                res.status(200).render('statistics', {
                    title: 'Statistics',
                    totalLikes: 0,
                    totalPosts: 0,
                    totalComments: 0,
                    mostRecentPost: null,
                    oldestPost: null,
                    mostLikedPost: null,
                    leastLikedPost: null
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Error calculating statistics");
        });
};
