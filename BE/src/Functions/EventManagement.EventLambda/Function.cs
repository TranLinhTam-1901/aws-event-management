using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using EventManagement.EventLambda.Routes;

[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace EventManagement.EventLambda;

public class Function
{
    private readonly EventRouteHandler _routeHandler;

    public Function()
    {
        _routeHandler = new EventRouteHandler();
    }

    public async Task<APIGatewayProxyResponse> FunctionHandler(
        APIGatewayProxyRequest request,
        ILambdaContext context)
    {
        return await _routeHandler.HandleAsync(request, context);
    }
}