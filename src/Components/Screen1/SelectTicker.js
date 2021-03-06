import React from 'react'
import Select from '@material-ui/core/Select'
import { connect } from 'react-redux'
import { inputTicker } from 'Actions/inputs'
import { getTickers, getOptionFeatures } from 'Actions/options'
import FormControl from '@material-ui/core/FormControl'
import { inputFieldTheme } from 'Themes/inputFields'
import { withStyles } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import LoadData from '../utils/LoadData'
import { getCalibrationBounds } from 'Actions/calibrator'
import { checkIsNative } from 'utils'

import {
  outerStyleInline,
  progressStyle,
  PROGRESS_SIZE
} from 'globals/progressStyles'
import ProgressBar from 'Components/utils/ProgressBar'
import PropTypes from 'prop-types'
const native = checkIsNative()
//export for testing
export const SelectTicker = withStyles(inputFieldTheme)(
  ({ onChange, value, onLoad, loadingTicker, options, classes }) => (
    <LoadData onLoad={onLoad}>
      {loadingTicker ? (
        <div style={outerStyleInline}>
          <ProgressBar
            size={PROGRESS_SIZE}
            style={progressStyle}
            loading={loadingTicker}
          />
        </div>
      ) : (
        <FormControl className={classes.inputField}>
          <InputLabel htmlFor="ticker-helper">Stock Ticker</InputLabel>
          <Select
            native={native}
            value={value}
            onChange={onChange}
            inputProps={{
              name: 'ticker',
              id: 'ticker-simple'
            }}
          >
            <option value="" key="none" />
            {options.map(option => (
              <option key={option.Symbol} value={option.Symbol}>
                {option.Name}
              </option>
            ))}
          </Select>
        </FormControl>
      )}
    </LoadData>
  )
)

SelectTicker.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  onLoad: PropTypes.func.isRequired,
  loadingTicker: PropTypes.bool.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      Symbol: PropTypes.string.isRequired,
      Name: PropTypes.string.isRequired
    })
  ),
  classes: PropTypes.shape({
    inputField: PropTypes.string.isRequired
  })
}

const mapStateToProps = ({ inputs, marketValues, loading }) => ({
  value: inputs.ticker,
  options: marketValues.tickers,
  loadingTicker: loading.ticker
})

const onChange = dispatch => {
  const tickerChange = inputTicker(dispatch)
  const optionFeaturesGet = getOptionFeatures(dispatch)
  return event => {
    const ticker = event.target.value
    tickerChange(ticker)
    optionFeaturesGet(ticker)
  }
}
const onLoad = dispatch => () => {
  getTickers(dispatch)
  getCalibrationBounds(dispatch)
}

const mapDispatchToProps = dispatch => ({
  onChange: onChange(dispatch),
  onLoad: onLoad(dispatch)
})
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SelectTicker)
