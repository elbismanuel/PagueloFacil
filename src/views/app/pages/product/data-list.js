/* eslint-disable */
import React, { useState, useEffect } from 'react';

import axios from 'axios';

import { apiUrl, authToken } from 'constants/defaultValues';

import ListPageHeading from 'containers/pages/ListPageHeading';
import AddNewModal from 'containers/pages/AddNewModal';
import ListPageListing from 'containers/pages/ListPageListing';
import useMousetrap from 'hooks/use-mousetrap';

const getIndex = (value, arr, prop) => {
	for (let i = 0; i < arr.length; i += 1) {
		if (arr[i][prop] === value) {
			return i;
		}
	}
	return -1;
};

const orderOptions = [
	{ column: 'amount', label: 'Monto' },
	{ column: 'status', label: 'Estado' },
	{ column: 'dateTms', label: 'Fecha' },
];
const pageSizes = [4, 8, 12, 20];

const categories = [

];

const DataListPages = ({ match }) => {
	const [isLoaded, setIsLoaded] = useState(false);
	const [displayMode, setDisplayMode] = useState('list');
	const [currentPage, setCurrentPage] = useState(0);
	const [offset, setOffset] = useState(0);
	const [selectedPageSize, setSelectedPageSize] = useState(8);
	const [selectedOrderOption, setSelectedOrderOption] = useState({
		column: 'amount',
		label: 'Monto',
	});

	const [modalOpen, setModalOpen] = useState(false);
	const [totalItemCount, setTotalItemCount] = useState(0);
	const [totalPage, setTotalPage] = useState(8);
	const [search, setSearch] = useState('');
	const [sort, setSort] = useState('');
	const [selectedItems, setSelectedItems] = useState([]);
	const [items, setItems] = useState([]);
	const [lastChecked, setLastChecked] = useState(null);

	useEffect(() => {
		setCurrentPage(0);

	}, [selectedPageSize, selectedOrderOption]);

	useEffect(() => {
		async function fetchData() {

			axios
				.get(
					//`${apiUrl}?pageSize=${selectedPageSize}&currentPage=${currentPage}&orderBy=${selectedOrderOption.column}&search=${search}`,
					`${apiUrl}?limit=${selectedPageSize}&Offset=${offset}&filter=cardType::${search.toUpperCase()}&Sort=${sort}`,
					{
						headers: {
							'Authorization': authToken
						}
					},
				)
				.then((res) => {
					return res.data;
				})
				.then((data) => {

					var reformattedArray = data.data.map(function (obj) {

						var rObj = {};

						rObj['date'] = obj.date;
						rObj['title'] = obj.codOper;
						rObj['date'] = obj.dateTms;
						rObj['category'] = obj.amount.toFixed(2);
						rObj['status'] = obj.messageSys;
						rObj['img'] = `../../../assets/img/credi-cards/${obj.cardType.toLowerCase()}.png`;

						let statusColor;
						obj.messageSys == 'DECLINE' ? statusColor = 'danger' : statusColor = 'success';

						rObj['statusColor'] = statusColor;
						rObj['id'] = obj.idTransaction;
						return rObj;
					});

					setItems(
						reformattedArray
					);
					/*data.data.map((x) => {
						return { ...x, img: x.img.replace('img/', 'img/products/') };
						console.log(x)
					})*/
					setSelectedItems([]);
					setIsLoaded(true)
					setTotalItemCount(data.data.length);
					//console.log(data.data.length)
				});
		}
		fetchData();
	}, [selectedPageSize, currentPage, selectedOrderOption, search, sort]);

	const onCheckItem = (event, id) => {
		if (
			event.target.tagName === 'A' ||
			(event.target.parentElement && event.target.parentElement.tagName === 'A')
		) {
			return true;
		}
		if (lastChecked === null) {
			setLastChecked(id);
		}

		let selectedList = [...selectedItems];
		if (selectedList.includes(id)) {
			selectedList = selectedList.filter((x) => x !== id);
		} else {
			selectedList.push(id);
		}
		setSelectedItems(selectedList);

		if (event.shiftKey) {
			let newItems = [...items];
			const start = getIndex(id, newItems, 'id');
			const end = getIndex(lastChecked, newItems, 'id');
			newItems = newItems.slice(Math.min(start, end), Math.max(start, end) + 1);
			selectedItems.push(
				...newItems.map((item) => {
					return item.id;
				})
			);
			selectedList = Array.from(new Set(selectedItems));
			setSelectedItems(selectedList);
		}
		document.activeElement.blur();
		return false;
	};

	const handleChangeSelectAll = (isToggle) => {
		if (selectedItems.length >= items.length) {
			if (isToggle) {
				setSelectedItems([]);
			}
		} else {
			setSelectedItems(items.map((x) => x.id));
		}
		document.activeElement.blur();
		return false;
	};

	const onContextMenuClick = (e, data) => {
		console.log('onContextMenuClick - selected items', selectedItems);
		console.log('onContextMenuClick - action : ', data.action);
	};

	const onContextMenu = (e, data) => {
		const clickedProductId = data.data;
		if (!selectedItems.includes(clickedProductId)) {
			setSelectedItems([clickedProductId]);
		}

		return true;
	};

	useMousetrap(['ctrl+a', 'command+a'], () => {
		handleChangeSelectAll(false);
	});

	useMousetrap(['ctrl+d', 'command+d'], () => {
		setSelectedItems([]);
		return false;
	});

	const startIndex = (currentPage - 1) * selectedPageSize;
	const endIndex = currentPage * selectedPageSize;

	return !isLoaded ? (
		<div className="loading" />
	) : (
		<>
			<div className="disable-text-selection">
				<ListPageHeading
					heading="menu.data-list"
					displayMode={displayMode}
					changeDisplayMode={setDisplayMode}
					handleChangeSelectAll={handleChangeSelectAll}
					changeOrderBy={(column) => {
						setSort(column);
					}}
					changePageSize={setSelectedPageSize}
					selectedPageSize={selectedPageSize}
					totalItemCount={totalItemCount}
					selectedOrderOption={selectedOrderOption}
					match={match}
					startIndex={startIndex}
					endIndex={endIndex}
					selectedItemsLength={selectedItems ? selectedItems.length : 0}
					itemsLength={items ? items.length : 0}
					onSearchKey={(e) => {
						if (e.key === 'Enter') {
							setSearch(e.target.value.toLowerCase());
						}
					}}
					orderOptions={orderOptions}
					pageSizes={pageSizes}
					toggleModal={() => setModalOpen(!modalOpen)}
				/>
				<AddNewModal
					modalOpen={modalOpen}
					toggleModal={() => setModalOpen(!modalOpen)}
					categories={categories}
				/>
				<ListPageListing
					items={items}
					displayMode={displayMode}
					selectedItems={selectedItems}
					onCheckItem={onCheckItem}
					currentPage={currentPage}
					totalPage={totalPage}
					onContextMenuClick={onContextMenuClick}
					onContextMenu={onContextMenu}
					onChangePage={(page) => {
						let currentOffSet;

						page == 1 ? currentOffSet = 0 : currentOffSet = (page - 1) * selectedPageSize;

						setCurrentPage(page)
						setOffset(currentOffSet)
						setTotalPage(totalPage + 8)
					}}
				/>
			</div>
		</>
	);
};

export default DataListPages;
