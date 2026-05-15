from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .utils import supabase  

@csrf_exempt
def logout_user(request):
    if request.method == "OPTIONS":
        response = JsonResponse({"status": "ok"})
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            u_id = data.get('user_id')

            if u_id:
                supabase.table('users') \
                    .update({'logged': False}) \
                    .eq('user_id', u_id) \
                    .execute()

                return JsonResponse({'success': True, 'message': 'Status logged ustawiony na False'})
            
            return JsonResponse({'success': False, 'message': 'Nie podano user_id'}, status=400)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    return JsonResponse({'error': 'Wymagana metoda POST'}, status=405)