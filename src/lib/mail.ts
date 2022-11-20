import { SMTP_PASSWORD, SMTP_SERVER, SMTP_USER } from '$env/static/private';
import * as nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

export async function sendMail(options: Mail.Options) {
	console.log(`sending email to ${options.to}`);
	if (!options.to) throw new Error('email is undefined');

	const transporter = nodemailer.createTransport({
		host: SMTP_SERVER,
		port: 587,
		auth: {
			user: SMTP_USER,
			pass: SMTP_PASSWORD
		}
	});
	const info = await transporter.sendMail(options);
	console.log('Message sent: %s', info.messageId);
}
