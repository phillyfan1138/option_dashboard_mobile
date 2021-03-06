import React from 'react'
import { getCall, getPut, getDensity, getRiskMetrics } from 'Actions/pricer'
import Box from '@material-ui/core/Box'
import { connect } from 'react-redux'
import PutCallChart from './PutCallChart'
import DensityChart from './DensityChart'
import ImpliedVolatilityChart from './ImpliedVolatilityChart'
import LoadData from 'Components/utils/LoadData'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import WarningNoValues from 'Components/utils/WarningNoValues'
import { isEmpty } from 'globals/utils'
import PropTypes from 'prop-types'
import { getBaseUrl } from 'Services/urlUtils'

export const sensitivities = [
  { value: 'price', label: 'Price' },
  { value: 'delta', label: 'Delta' },
  { value: 'gamma', label: 'Gamma' },
  { value: 'theta', label: 'Theta' }
]
const handleChange = (match, history, updateOptions, attributes) => (
  _,
  value
) => {
  const { value: sensitivity } = sensitivities[value]
  updateOptions({ ...attributes, sensitivity })
  history.push(getBaseUrl(match) + sensitivity)
}

//exported for testing
export const SensitivityNav = ({
  match,
  history,
  updateOptions,
  attributes
}) => (
  <Tabs
    value={sensitivities.findIndex(v => v.value === match.params.sensitivity)}
    onChange={handleChange(match, history, updateOptions, attributes)}
    fullWidth
  >
    {sensitivities.map(({ value, label }) => (
      <Tab label={label} key={value} />
    ))}
  </Tabs>
)
SensitivityNav.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    params: PropTypes.shape({
      sensitivity: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  updateOptions: PropTypes.func.isRequired,
  attributes: PropTypes.object.isRequired
}
const fullWidth = { width: '100%' }

//exported for testing
export const ChartsScreen = ({
  onLoad,
  attributes,
  match,
  history,
  updateOptions,
  calibrated
}) =>
  isEmpty(calibrated) ? (
    <Box display="flex" flexWrap="wrap">
      <Box style={fullWidth}>
        <WarningNoValues
          links={[
            { to: '/tab/1', label: 'Market Prices' },
            { to: '/tab/2', label: 'Calibration' }
          ]}
        />
      </Box>
    </Box>
  ) : (
    <LoadData
      onLoad={onLoad}
      attributes={attributes}
      sensitivity={match.params.sensitivity}
    >
      <Box display="flex" flexWrap="wrap">
        <Box style={fullWidth}>
          <PutCallChart sensitivity={match.params.sensitivity} />
        </Box>
        <Box style={fullWidth}>
          <SensitivityNav
            match={match}
            history={history}
            attributes={attributes}
            updateOptions={updateOptions}
          />
        </Box>
        <Box style={fullWidth}>
          <ImpliedVolatilityChart />
        </Box>
        <Box style={fullWidth}>
          <DensityChart />
        </Box>
      </Box>
    </LoadData>
  )
ChartsScreen.propTypes = {
  onLoad: PropTypes.func.isRequired,
  attributes: PropTypes.object.isRequired,
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    params: PropTypes.shape({
      sensitivity: PropTypes.string.isRequired
    }).isRequired
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  updateOptions: PropTypes.func.isRequired,
  calibrated: PropTypes.object.isRequired
}
const mapStateToProps = ({ calibratorValues }) => ({
  attributes: {
    ...calibratorValues.attributes,
    ...calibratorValues.calibrated
  },
  calibrated: calibratorValues.calibrated
})

//exported for testing
export const onLoad = dispatch => {
  const getP = getPut(dispatch)
  const getC = getCall(dispatch)
  const getD = getDensity(dispatch)
  const getR = getRiskMetrics(dispatch)
  return ({ attributes, sensitivity }) => {
    const objToSend = { ...attributes, sensitivity }
    getP(objToSend)
    getC(objToSend)
    getD(attributes)
    getR(attributes)
  }
}
//export for testing
export const updateOptions = dispatch => {
  const getP = getPut(dispatch)
  const getC = getCall(dispatch)
  return attributes => {
    getP(attributes)
    getC(attributes)
  }
}

const mapDispatchToProps = dispatch => ({
  onLoad: onLoad(dispatch),
  updateOptions: updateOptions(dispatch)
})
export default connect(mapStateToProps, mapDispatchToProps)(ChartsScreen)
