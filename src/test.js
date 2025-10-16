import nodemailer from "nodemailer";
import dotenv from "dotenv";
import  PocketBase  from 'pocketbase';

dotenv.config();



console.log('Initializing PocketBase client...');
const pb = new PocketBase(process.env.PB_URL);
await pb.collection('_superusers').authWithPassword(
  process.env.PB_ADMIN_USER, 
  process.env.PB_ADMIN_PASS
);

// post list that just verify but not notify yet
    let favList = [];
    const resultPost = await pb.collection('Posts').getList(1, 50, {
        filter: 'Verify = true && Notify = false', 
        sort: '-created',
    });
    console.log('resultPost: ', resultPost);
    // user favorite group by post event that not notify yet
    await Promise.all(resultPost.items.map(async (item) => {
        favList.push(await pb.collection('Favorites').getFullList(200, {
            filter: `PostID = "${item.id}" && Notify = false`, 
            expand: 'PostID,UserID',
            sort: 'created',
        }));
    }));

    favList = favList.flat();
    console.log('favList: ', JSON.stringify(favList, null, 2));
    
    // Example: Access expanded data
    favList.forEach((fav, index) => {
        console.log(`\n--- Favorite #${index + 1} ---`);
        console.log('User Name:', fav.expand?.UserID?.name);
        console.log('User Email:', fav.expand?.UserID?.email);
        console.log('Post Title:', fav.expand?.PostID?.Topic);
    });