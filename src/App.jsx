import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import cn from 'classnames';

import routes from './routes.js';

const App = () => {
  const [currencies, setCurrencies] = useState([]);
  const [currencyNames, setCurrencyNames] = useState('');
  const [leftCurrency, setLeftCurrency] = useState({});
  const [rightCurrency, setRightCurrency] = useState({});
  const [minCurrencyAmount, setMinCurrencyAmount] = useState(0);
  const [hasLeftOptions, dropLeftOptions] = useState(false);
  const [hasRightOptions, dropRightOptions] = useState(false);
  const [isDisabledPair, setPairStatus] = useState(false);

  const formik = useFormik({
    initialValues: {
      leftCurrencyAmount: '',
      rightCurrencyAmount: '',
      address: '',
    },
  });

  const {
    values,
    handleSubmit,
    handleChange,
    isSubmitting,
    setFieldValue,
  } = formik;

  useEffect(() => {
    if (currencies.length > 0) {
      (async function () {
        try {
          const res = await axios.get(routes.minimalExchangeAmountApiPath(currencyNames));
          setMinCurrencyAmount(res.data.minAmount);
          console.log(res.data);
          setPairStatus(false);
          setFieldValue('leftCurrencyAmount', res.data.minAmount);
        } catch(e) {
          setPairStatus(true);
        }
      })();
    }
  }, [leftCurrency]);

  useEffect(() => {
    if (currencies.length > 0 && values.leftCurrencyAmount > 0 && values.leftCurrencyAmount >= minCurrencyAmount) {
      (async function () {
        try {
        const res = await axios.get(routes.estimatedExchangeAmountApiPath(values.leftCurrencyAmount, currencyNames));
        console.log(res.data);
        setPairStatus(false);
        setFieldValue('rightCurrencyAmount', res.data.estimatedAmount);
        } catch(e) {
          setPairStatus(true);
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
      const fromToCurrencies = `${res.data[0].ticker}_${res.data[1].ticker}`;
      setCurrencyNames(fromToCurrencies);
      setLeftCurrency(res.data[0]);
      setRightCurrency(res.data[1]);
    })();
  }, []);


  const handleLeftCurrencyClick = () => dropLeftOptions(!hasLeftOptions);
  const handleRightCurrencyClick = () => dropRightOptions(!hasRightOptions);

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
                <input placeholder="Search" />
                <div onClick={handleLeftCurrencyClick} />
              </div>
              <div className="currencies-wrapper">
                {currencies.map((el) => (
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
              <input readOnly value={minCurrencyAmount <= values.leftCurrencyAmount ? values.rightCurrencyAmount : '-'} name="rightCurrencyAmount" type="text" onChange={handleChange} />
              <div className="selector-currency" onClick={handleRightCurrencyClick}>
                <img src={rightCurrency.image} />
                <p>{rightCurrency.ticker}</p>
              </div>
            </div>
            <div className="drop-down-currency" style={{ display: hasRightOptions ? 'flex' : 'none' }}>
              <div className="search-wrapper">
                <input placeholder="Search" />
                <div onClick={handleRightCurrencyClick} />
              </div>
              <div className="currencies-wrapper">
                {currencies.map((el) => (
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
            {isDisabledPair && <p>This pair is disabled now</p>}
            {minCurrencyAmount > values.leftCurrencyAmount && <p>Exchange amount too small</p>}
          </div>
        </div>
      </form>
    </div>
  );
};

export default App;
