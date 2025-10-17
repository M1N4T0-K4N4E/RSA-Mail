import dotenv from "dotenv";
import  PocketBase  from 'pocketbase';

dotenv.config();
const startnum = 10000;

const pb = new PocketBase(process.env.PB_URL || "");
await pb.collection('_superusers').authWithPassword(
  process.env.PB_ADMIN_USER || '', 
  process.env.PB_ADMIN_PASS || ''
);

async function createUser(count) {
  const data = `${count}newuser@example.com`;
    const userData = {
    email: data,
    password: data,
    passwordConfirm: data,
    StudentNo: startnum + count,
    Fname: `User${count}`,
  };

  try {
    const user = await pb.collection('users').create(userData);
    console.log('User created successfully:', count);
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

async function createPost(count) {
    // 5 posts are verified, others are not
    const postData = {
        Topic: `New Post ${count}`,
        ViewDescription: `This is the view description for post ${count}.`,
        AllDescription: `This is the full description for post ${count}.`,
        Period: "2024-01-01 to 2024-12-31",
        Organized: "smt",
        Contact: "smt",
        Verify: count > 5 ?  false : true,
        Notify: false,
    };
    try {
        const post = await pb.collection('Posts').create(postData);
        console.log('Post created successfully:', count);
    } catch (error) { 
        console.error('Error creating post:', error);
    }
}

async function createFavorite(uId, pId) {
    const userId = (await pb.collection('users').getList(1, 1, {
        filter: `StudentNo = "${startnum + uId}"`,
    })).items[0].id;
    const postId = (await pb.collection('Posts').getList(1, 1, {
        filter: `Topic = "New Post ${pId}"`,
    })).items[0].id;

    const favData = {
        UserID: userId,
        PostID: postId,
        Notify: false,
    };
    try {
        const fav = await pb.collection('Favorites').create(favData);
        console.log('Favorite created successfully:', fav);
    } catch (error) {
        console.error('Error creating favorite:', error);
    }
}

async function main() {
    // create data with user bind on created favorite
    for (let i = 1; i <= 10; i++) {
        await createUser(i);
        await createPost(i);
        await createFavorite(i, i);
    }
}

main();