import { adminRoot } from './defaultValues';

const data = [

		{
			id: 'pages',
			icon: 'iconsminds-dollar',
			label: 'menu.pages',
			to: `${adminRoot}/pages`,
			subs: [
			
					{
							id: 'pages-product',
							label: 'menu.product',
							to: `${adminRoot}/pages/product`,
							subs: [
									{
											icon: 'simple-icon-credit-card',
											label: 'menu.data-list',
											to: `${adminRoot}/pages/product/data-list`,
									},
							
							],
					},

			],
	},
];
export default data;
