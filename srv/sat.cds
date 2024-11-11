using { API_INSPECTIONLOT_SRV as inspectionLot } from './external/API_INSPECTIONLOT_SRV';
using {com.satinfotech.inspection as inspection} from '../db/schema';
service InspectionService {
    entity InspectionLot as projection on inspectionLot.A_InspectionLot {
            key InspectionLot,	
            Material,
            Batch,
            Plant,
            InspectionLotOrigin,
            GoodsMovementType,
            SalesOrder,
            SalesOrderItem,
            Language,
    }actions{
        action printForm(labelname:String
            @Common.ValueList: {
            CollectionPath: 'Label', 
            Label: 'Label',
            Parameters: [
            {
                $Type: 'Common.ValueListParameterInOut',
                LocalDataProperty: 'labelname',  
                ValueListProperty: 'Label'    
            }
        ]
      }) returns String
    };

    entity Label           as projection on inspection.Label;

    entity InspectionCharacteristic as projection on inspectionLot.A_InspectionCharacteristic {
            key InspectionLot,	
            InspPlanOperationInternalID,
            InspectionCharacteristic,
            InspectionSpecificationText,
            QuantityUnit,
            InspectionMethod,
            InspectionSpecification,
            InspectorQualification,
    }

    entity InspectionOperation as projection on inspectionLot.A_InspectionOperation {
            key InspectionLot,
            InspPlanOperationInternalID,
            OrderInternalBillOfOperations,
            InspectionOperation
    }

    entity InspectionResult as projection on inspectionLot.A_InspectionResult{
            key InspectionLot,
            InspPlanOperationInternalID,
            InspectionCharacteristic,
            InspectionResultAttribute,
            InspectionValuationResult,
            InspectionResultMeanValue,
            CharacteristicAttributeCode,
            InspectionStartDate,
            InspectionEndDate,
            CreatedByUser,
            CreationDate,
            CharacteristicAttributeCodeGrp,
    }
    entity InspectionResultValue as projection on inspectionLot.A_InspectionResultValue{
            key InspectionLot,
            InspPlanOperationInternalID,
            InspectionCharacteristic,
            Inspector,
            InspectionStartDate,
            InspectionEndDate,
            InspectionResultAttribute,
            InspectionResultMeasuredValue
    };

annotate InspectionService.Label with @(UI.LineItem: [
    {
        $Type: 'UI.DataField',
        Value: Label
    }
],
)
}


