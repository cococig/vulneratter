import { Prisma, PrismaClient } from "@prisma/client";
import { config } from "./config/config";
import { hash } from "bcrypt";

const prisma = new PrismaClient();
const isRawPassword = config.vulnerabilities.rawPassword;

/**
 * ハッシュ化されたパスワードを生成する関数。
 * @param rawPassword 生の（非ハッシュ化）パスワード
 * @returns ハッシュ化されたパスワード
 */
const createHashedPassword = async (rawPassword: string): Promise<string> => {
	return await hash(rawPassword, 10);
};

const userSeedBaseData: Prisma.UserCreateInput[] = [
	{
		email: "hayata@example.com",
		name: "FastFieldMove",
		password: "beta_c",
		articles: {
			create: [
				{
					content: "カレー美味しい！",
				},
				{
					content: "危うく事故りかけた……気をつけよう",
				},
			],
		},
	},
	{
		email: "dan@example.com",
		name: "モロボシくん",
		password: "eye_ultra",
		articles: {
			create: [
				{
					content: "今日は登山に来ています。いい景色！",
				},
				{
					content: "最近、息子が構ってくれなくて寂しい……",
				},
			],
		},
	},
	{
		email: "hideki@example.com",
		name: "Go!",
		password: "starlight",
		articles: {
			create: [
				{
					content: "新車買いました！たくさん走りたい！",
				},
				{
					content: "天気が良いので布団を干した！",
				},
			],
		},
	},
	{
		email: "HokutoAndMinami@example.com",
		name: "North❤️South",
		password: "ring_and_touch",
		articles: {
			create: [
				{
					content: "今日は記念日。二人でゆっくり過ごします",
				},
				{
					content: "今夜は月が綺麗だなぁ",
				},
			],
		},
	},
];

const createUserSeedData = async (): Promise<Prisma.UserCreateInput[]> => {
	const result: Prisma.UserCreateInput[] = [];
	for (const user of userSeedBaseData) {
		if (!isRawPassword) {
			const hashedPassword = await createHashedPassword(user.password);
			console.log(hashedPassword);
			user.password = hashedPassword;
		}
		result.push(user);
	}

	return result;
};

const main = async () => {
	await prisma.user.deleteMany();
	await prisma.article.deleteMany();
	await prisma.session.deleteMany();

	for (const user of await createUserSeedData()) {
		await prisma.user.create({
			data: user,
			include: {
				articles: true,
			},
		});
	}
};

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
