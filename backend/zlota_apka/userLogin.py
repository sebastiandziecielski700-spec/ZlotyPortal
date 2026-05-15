from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .utils import supabase 

@csrf_exempt
def user_login(request):
    if request.method == "OPTIONS":
        response = JsonResponse({"status": "ok"})
        response["Access-Control-Allow-Origin"] = "http://192.168.0.192:3000"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            login_val = body.get('login')
            pass_val = body.get('password')
            result = supabase.table('users').select("*") \
                .eq('login', login_val) \
                .eq('password', pass_val) \
                .execute()
            if result.data and len(result.data) > 0:
                user = result.data[0]
                user_id = user['user_id']
                supabase.table('users') \
                    .update({'logged': True}) \
                    .eq('user_id', user_id) \
                    .execute()

                return JsonResponse({
                    'success': True,
                    'user': {
                        'id': user_id,
                        'surname': user['surename'],
                        'name': user.get('name', ''),
                        'class': user['clase']
                    }
                })
            
            return JsonResponse({'success': False, 'message': 'Błędny login lub hasło'}, status=401)

        except Exception as e:
            print(f"Błąd logowania użytkownika: {e}")
            return JsonResponse({'success': False, 'message': str(e)}, status=500)

    return JsonResponse({'error': 'Method not allowed'}, status=405)