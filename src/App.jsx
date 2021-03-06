import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';

import routes from './routes.js';

const App = () => {
  const [currencies, setCurrencies] = useState([]);
  const [leftCurrencyList, filterLeftCurrencyList] = useState([]);
  const [rightCurrencyList, filterRightCurrencyList] = useState([]);
  const [currencyNames, setCurrencyNames] = useState('');
  const [leftCurrency, setLeftCurrency] = useState({});
  const [rightCurrency, setRightCurrency] = useState({});
  const [minCurrencyAmount, setMinCurrencyAmount] = useState(0);
  const [hasLeftOptions, dropLeftOptions] = useState(false);
  const [hasRightOptions, dropRightOptions] = useState(false);
  const [errorStatus, setErrorStatus] = useState('');

  const formik = useFormik({
    initialValues: {
      leftCurrencyAmount: '',
      rightCurrencyAmount: '',
      leftCurrencyPart: '',
      rightCurrencyPart: '',
      address: '',
    },
  });

  const {
    values,
    handleSubmit,
    handleChange,
    setFieldValue,
  } = formik;

  useEffect(() => {
    if (currencies.length > 0) {
      (async function () {
        try {
          const res = await axios.get(routes.minimalExchangeAmountApiPath(currencyNames));
          setMinCurrencyAmount(res.data.minAmount);
          setErrorStatus('');
          setFieldValue('leftCurrencyAmount', res.data.minAmount);
        } catch(e) {
          setErrorStatus('pair');
        }
      })();
    }
  }, [leftCurrency]);

  useEffect(() => {
    if (currencies.length > 0 && values.leftCurrencyAmount > 0 && values.leftCurrencyAmount >= minCurrencyAmount) {
      (async function () {
        try {
          const res = await axios.get(routes.estimatedExchangeAmountApiPath(values.leftCurrencyAmount, currencyNames));
          setErrorStatus('');
          setFieldValue('rightCurrencyAmount', res.data.estimatedAmount);
        } catch(e) {
          if (e.response.data.error === 'deposit_too_small') {
            setErrorStatus('small');
          } else {
            setErrorStatus('pair');
          }
        }
      })();
    }
  }, [rightCurrency, values.leftCurrencyAmount]);

  useEffect(() => {
    (async function () {
      const res = await axios.get(routes.listCurrenciesApiPath({
        active: true,
      }));
      setCurrencies(res.data);
      filterLeftCurrencyList(res.data);
      filterRightCurrencyList(res.data);
      const fromToCurrencies = `${res.data[0].ticker}_${res.data[1].ticker}`;
      setCurrencyNames(fromToCurrencies);
      setLeftCurrency(res.data[0]);
      setRightCurrency(res.data[1]);
    })();
  }, []);


  const handleLeftCurrencyClick = () => {
    setFieldValue('leftCurrencyPart', '');
    filterLeftCurrencyList(currencies);
    dropLeftOptions(!hasLeftOptions);
  };

  const handleRightCurrencyClick = () => {
    setFieldValue('rightCurrencyPart', '');
    filterRightCurrencyList(currencies);
    dropRightOptions(!hasRightOptions);
  };

  const handleLeftOptionClick = (el) => {
    const ticker = el.target.getAttribute('data-key');
    const currentCurrency = currencies.find((el) => el.ticker === ticker);
    const fromToCurrencies = `${currentCurrency.ticker}_${rightCurrency.ticker}`;
    setCurrencyNames(fromToCurrencies);
    setLeftCurrency(currentCurrency);
    dropLeftOptions(!hasLeftOptions);
  };

  const handleRightOptionClick = (el) => {
    const ticker = el.target.getAttribute('data-key');
    const currentCurrency = currencies.find((el) => el.ticker === ticker);
    const fromToCurrencies = `${leftCurrency.ticker}_${currentCurrency.ticker}`;
    setCurrencyNames(fromToCurrencies);
    setRightCurrency(currentCurrency);
    dropRightOptions(!hasRightOptions);
  };

  const searchLeftList = (word) => {
    const filtered = currencies.filter((el) => {
      const comparedWord = word.toLowerCase();
      const lowerEl = el.name.substr(0, word.length).toLowerCase();
      return lowerEl === comparedWord;
    });
    filterLeftCurrencyList(filtered);
  };

  const searchRightList = (word) => {
    const filtered = currencies.filter((el) => {
      const comparedWord = word.toLowerCase();
      const lowerEl = el.name.substr(0, word.length).toLowerCase();
      return lowerEl === comparedWord;
    });
    filterRightCurrencyList(filtered);
  };

  return (
    <div className="crypto-main">
      <h1>Crypto Exchange</h1>
      <p>Exchange fast and easy</p>
      <form className="crypto-form" onSubmit={handleSubmit}>
        <div className="currency-wrapper">
          <div>
            <div className="selector-currency-wrapper"  style={{ display: hasLeftOptions ? 'none' : 'flex' }}>
              <input value={values.leftCurrencyAmount} name="leftCurrencyAmount" type="text"  onChange={handleChange} />
              <div className="selector-currency" onClick={handleLeftCurrencyClick}>
                <img src={leftCurrency.image} />
                <p>{leftCurrency.ticker}</p>
              </div>
            </div>
            <div className="drop-down-currency" style={{ display: hasLeftOptions ? 'flex' : 'none' }}>
              <div className="search-wrapper">
                <input value={values.leftCurrencyPart} type="text" name="leftCurrencyPart" placeholder="Search" onChange={(e) => {
                  handleChange(e);
                  searchLeftList(e.currentTarget.value);
                }} />
                <div onClick={handleLeftCurrencyClick} />
              </div>
              <div className="currencies-wrapper">
                {leftCurrencyList.map((el) => (
                  <div key={el.ticker} data-key={el.ticker} className="currency" onClick={(el) => handleLeftOptionClick(el)} >
                    <img src={el.image} />
                    <p>{el.ticker}</p>
                    <p>{el.name}</p>
                  </div>))}
              </div>
            </div>
          </div>
          <img src="/images/swap.svg" />
          <div>
            <div className="selector-currency-wrapper" style={{ display: hasRightOptions ? 'none' : 'flex' }}>
              <input readOnly value={(minCurrencyAmount <= values.leftCurrencyAmount && errorStatus === '') ? values.rightCurrencyAmount : '-'} name="rightCurrencyAmount" type="text" onChange={handleChange} />
              <div className="selector-currency" onClick={handleRightCurrencyClick}>
                <img src={rightCurrency.image} />
                <p>{rightCurrency.ticker}</p>
              </div>
            </div>
            <div className="drop-down-currency" style={{ display: hasRightOptions ? 'flex' : 'none' }}>
              <div className="search-wrapper">
                <input value={values.rightCurrencyPart} type="text" name="rightCurrencyPart" placeholder="Search" onChange={(e) => {
                  handleChange(e);
                  searchRightList(e.currentTarget.value);
                }} />
                <div onClick={handleRightCurrencyClick} />
              </div>
              <div className="currencies-wrapper">
                {rightCurrencyList.map((el) => (
                  <div key={el.ticker} data-key={el.ticker} className="currency" onClick={(el) => handleRightOptionClick(el)}>
                    <img src={el.image} />
                    <p>{el.ticker}</p>
                    <p>{el.name}</p>
                  </div>))}
              </div>
            </div>
          </div>
        </div>
        <div className="approval-wrapper">
          <label htmlFor="address">
            {`Your ${rightCurrency.name} address`}
          <input name="address" type="text" onChange={handleChange} />
          </label>
          <div>
            <button type="submit">Exchange</button>
            {errorStatus === 'pair' && <p>This pair is disabled now</p>}
            {(minCurrencyAmount > values.leftCurrencyAmount || errorStatus === 'small') && <p>Exchange amount too small</p>}
          </div>
        </div>
      </form>
    </div>
  );
};

export default App;
