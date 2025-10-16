import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Pocketbase, { RecordModel } from "pocketbase";
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.APP_USER, 
      pass: process.env.APP_PASSWORD, 
    },
  });

async function sendEmail() {
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.APP_USER, 
      pass: process.env.APP_PASSWORD, 
    },
  });


  const mailOptions = {
    from: `<${process.env.APP_USER}>`,
    to: `<${process.env.APP_USER}>`, 
    subject: 'test mail from Node.js', 
    text: 'hello testๆ', 
    html: '<b>hi</b><p>this is HTML part</p>', 
  };


  try {
    console.log('sending mail...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    console.log('Message ID: ' + info.messageId);
    console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error occurred while sending email:', error);
  }
}

async function sendNotifyMail(data: RecordModel) {
  if (!data.expand || !data.expand.UserID) {
    console.error('No user data found in expand.UserID');
    return;
  }

  const postInfo = data.expand.PostID;
  const user = data.expand.UserID;

  const mailOptions = {
    from: `<${process.env.APP_USER}>`,
    // to: `${user.email}`, // Send to user's actual email
    to: `<${process.env.APP_USER}>`, // Send to developer for testing
    subject: `Event ${postInfo.Topic || 'Untitled'} is ready for register!`,
    text: `Hello ${user.Fname || 'User'},\n\nYou have a new notification for the event ${postInfo.Topic || 'Untitled'}\n\nBest regards,\nRSA Team`,
    html: `
    <h1>Notify</h1>
    <p>Hello ${user.Fname || 'User'},</p>
    <p>You have a new notification for the event <strong>${postInfo.Topic || 'Untitled'}</strong></p>
    <p>The event <strong>${postInfo.Topic || 'Untitled'}</strong> is ready for registration!</p>
  `, 
  };


  try {
    console.log('sending mail...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    console.log('Message ID: ' + info.messageId);
    console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error occurred while sending email:', error);
  }
}

async function prepareNotifyMail(data: any[]) {
  if (!data || data.length === 0) {
    console.log('No data to send, skipping email.');
    return;
  }

  // send mail and then update status after send notify mail
  const pb = new Pocketbase(process.env.PB_URL || '');
  await pb.collection('_superusers').authWithPassword(
    process.env.PB_ADMIN_USER || '', 
    process.env.PB_ADMIN_PASS || ''
  );

  for (const record of data) {
    await sendNotifyMail(record);
    await pb.collection('Favorites').update(record.id, { Notify: true });
    await pb.collection('Posts').update(record.expand.PostID.id, { Notify: true });
    console.log(`Updated Notify status for favorite ${record.id}`);
  }
}

export { prepareNotifyMail };

// เรียกใช้งานฟังก์ชัน
// sendEmail();